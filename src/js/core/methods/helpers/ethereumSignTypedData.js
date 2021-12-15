/* @flow */

import BigNumber from 'bignumber.js';
import { Buffer } from 'buffer';

import type {
    TypedCall,
    EthereumTypedDataStructRequest,
    EthereumTypedDataStructAck,
    EthereumTypedDataValueRequest,
    EthereumTypedDataSignature,
    EthereumStructMember,
    EthereumFieldType,
} from '../../../types/trezor/protobuf';
import { Enum_EthereumDataType } from '../../../types/trezor/protobuf';

type EIP712FieldType = { name: string, type: string };
type EIP712StructType = [EIP712FieldType];
type EIP712Types = { [string]: EIP712StructType };
type PreparedTypes = { [string]: EthereumTypedDataStructAck };

const NAME_TO_DATA_TYPE = {
    uint: Enum_EthereumDataType.UINT,
    int: Enum_EthereumDataType.INT,
    string: Enum_EthereumDataType.STRING,
    address: Enum_EthereumDataType.ADDRESS,
    bool: Enum_EthereumDataType.BOOL,
    bytes: Enum_EthereumDataType.BYTES,
};

const ARRAY_LENGTH_TYPE: EthereumFieldType = {
    data_type: Enum_EthereumDataType.UINT,
    size: 2,
};

const getArrayType = (typeName: string) => {
    const match = typeName.match(/^(.+)\[(\d*)\]$/);
    if (!match) {
        throw new Error('Invalid array type');
    }
    const length = match[2] === '' ? undefined : parseInt(match[2], 10);
    return [match[1], length];
};

const getFieldType = (types: EIP712Types, typeName: string): EthereumFieldType => {
    if (typeName.endsWith(']')) {
        const [memberType, size] = getArrayType(typeName);
        return {
            data_type: Enum_EthereumDataType.ARRAY,
            size,
            entry_type: getFieldType(types, memberType),
        };
    }

    const firstLetter = typeName.charAt(0);
    if (firstLetter.toUpperCase() === firstLetter) {
        return {
            data_type: Enum_EthereumDataType.STRUCT,
            size: types[typeName].length,
            struct_name: typeName,
        };
    }

    const match = typeName.match(/^([a-z]+)(\d*)$/);
    if (!match) {
        throw new Error('Invalid field type');
    }
    const [name, sizeStr] = match;
    if (!(name in NAME_TO_DATA_TYPE)) {
        throw new Error('Invalid field type');
    }
    const dataType = NAME_TO_DATA_TYPE[name];
    if (dataType in [Enum_EthereumDataType.UINT, Enum_EthereumDataType.INT]) {
        if (sizeStr === '') {
            throw new Error('Invalid field type');
        }
        return {
            data_type: dataType,
            size: Math.floor(parseInt(sizeStr, 10) / 8),
        };
    }
    if (
        dataType in
        [Enum_EthereumDataType.STRING, Enum_EthereumDataType.ADDRESS, Enum_EthereumDataType.BOOL]
    ) {
        if (sizeStr !== '') {
            throw new Error('Invalid field type');
        }
        return { data_type: dataType };
    }
    return {
        data_type: dataType,
        size: sizeStr === '' ? undefined : parseInt(sizeStr, 10),
    };
};

const encodeStructType = (types: EIP712Types, typeName: string): Array<EthereumStructMember> => {
    if (!(typeName in types)) {
        throw new Error('Unknown struct type');
    }

    return types[typeName].map(({ name, type }) => {
        const fieldType = getFieldType(types, type);
        return { name, type: fieldType };
    });
};

const encodeValue = (type: EthereumFieldType, value: any): string => {
    switch (type.data_type) {
        case Enum_EthereumDataType.UINT:
        case Enum_EthereumDataType.INT: {
            const numberSize = type.size;
            if (numberSize === undefined) {
                throw new Error('Invalid field type');
            }
            let bn = new BigNumber(value);
            const buf = Buffer.alloc(numberSize);
            for (let i = 0; i < numberSize; ++i) {
                buf[numberSize - i] = bn.mod(256).toNumber();
                bn = bn.div(256);
            }
            return buf.toString('hex');
        }
        case Enum_EthereumDataType.STRING:
            return value;
        case Enum_EthereumDataType.ADDRESS: {
            const hex = value.replace(/^0x/, '');
            if (hex.length !== 40) {
                throw new Error('Invalid address');
            }
            return hex;
        }
        case Enum_EthereumDataType.BOOL:
            return value ? '01' : '00';
        case Enum_EthereumDataType.BYTES: {
            const hex = value.replace(/^0x/, '');
            if (type.size !== undefined && hex.length !== type.size * 2) {
                throw new Error('Invalid bytes length');
            }
            return hex;
        }
        default:
            throw new Error('Cannot encode value of struct/array type');
    }
};

const encodeArrayLength = (array: any[]): string => encodeValue(ARRAY_LENGTH_TYPE, array.length);

const prepareTypes = (types: EIP712Types): PreparedTypes => {
    const result = {};
    // eslint-disable-next-line guard-for-in
    for (const typeName in types) {
        result[typeName] = { members: encodeStructType(types, typeName) };
    }
    return result;
};

const prepareValues = (types: PreparedTypes, eip712Message: { [string]: any }): any[] => {
    let prepareStruct;

    const prepareSingleValue = (type: EthereumFieldType, value: any) => {
        switch (type.data_type) {
            case Enum_EthereumDataType.ARRAY: {
                const entryType = type.entry_type;
                if (entryType === undefined) {
                    throw new Error('Invalid field type');
                }
                return value.map(v => prepareSingleValue(entryType, v));
            }
            case Enum_EthereumDataType.STRUCT: {
                const structName = type.struct_name;
                if (structName === undefined) {
                    throw new Error('Invalid field type');
                }
                return prepareStruct(structName, value);
            }
            default:
                return encodeValue(type, value);
        }
    };

    prepareStruct = (structName: string, values: { [string]: any }): any[] =>
        types[structName].members.map(member => {
            if (!(member.name in values)) {
                throw new Error(`Missing value for field ${member.name}`);
            }
            return prepareSingleValue(member.type, values[member.name]);
        });

    const result = [];
    result.push(prepareStruct('EIP712Domain', eip712Message.domain));
    result.push(prepareStruct(eip712Message.primaryType, eip712Message.message));

    return result;
};

let processEIP712Request;

const processStructRequest = async (
    typedCall: TypedCall,
    request: EthereumTypedDataStructRequest,
    preparedTypes: PreparedTypes,
    preparedValues: any[],
): EthereumTypedDataSignature => {
    const response = await typedCall(
        'EthereumTypedDataStructAck',
        'EthereumTypedDataStructRequest|EthereumTypedDataValueRequest|EthereumTypedDataSignature',
        prepareTypes[request.name],
    );
    return processEIP712Request(typedCall, response, preparedTypes, preparedValues);
};

const processValueRequest = async (
    typedCall: TypedCall,
    request: EthereumTypedDataValueRequest,
    preparedTypes: PreparedTypes,
    preparedValues: any[],
): EthereumTypedDataSignature => {
    let data: string | any[] = '';
    for (const idx of request.member_path) {
        data = preparedValues[idx];
    }
    let value;
    if (Array.isArray(data)) {
        value = encodeArrayLength(data);
    } else {
        value = data;
    }
    const response = await typedCall(
        'EthereumTypedDataValueAck',
        'EthereumTypedDataStructRequest|EthereumTypedDataValueRequest|EthereumTypedDataSignature',
        { value },
    );
    return processEIP712Request(typedCall, response, preparedTypes, preparedValues);
};

processEIP712Request = async (
    typedCall: TypedCall,
    request: {
        type: string,
        message:
            | EthereumTypedDataStructRequest
            | EthereumTypedDataValueRequest
            | EthereumTypedDataSignature,
    },
    preparedTypes: PreparedTypes,
    preparedValues: any[],
): EthereumTypedDataSignature => {
    switch (request.type) {
        case 'EthereumTypedDataStructRequest':
            return await processStructRequest(typedCall, request.message, preparedTypes, preparedValues);
        case 'EthereumTypedDataValueRequest':
            return await processValueRequest(typedCall, request.message, preparedTypes, preparedValues);
        case 'EthereumTypedDataSignature':
            return request.message;
        default:
            throw new Error('Invalid request type');
    }
};

export const ethereumSignTypedData = async (
    typedCall: TypedCall,
    address_n: number[],
    eip712Message: { [string]: any },
): EthereumTypedDataSignature => {
    const preparedTypes = prepareTypes(eip712Message.types);
    const preparedValues = prepareValues(preparedTypes, eip712Message);
    const response = await typedCall('EthereumSignTypedData', 'EthereumTypedDataStructRequest', {
        address_n,
        primary_type: eip712Message.primaryType,
        metamask_v4_compat: true,
    });
    return processEIP712Request(typedCall, response, preparedTypes, preparedValues);
};