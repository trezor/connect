// flowtype only
// flowtype doesn't have `enum` declarations like typescript

const fs = require('fs');
const { RULE_PATCH, TYPE_PATCH, DEFINITION_PATCH, SKIP } = require('./protobuf-patches');
const json = require('../src/data/messages/messages.json');

const args = process.argv.slice(2);

const isTypescript = args.includes('typescript');

// proto types to javascript types
const FIELD_TYPES = {
    uint32: 'number',
    uint64: 'number',
    sint32: 'number',
    sint64: 'number',
    bool: 'boolean',
    bytes: 'string',
    // 'bytes': 'Uint8Array | number[] | Buffer | string', // protobuf will handle conversion
};

const types = []; // { type: 'enum | message', name: string, value: string[], exact?: boolean };

// enums used as keys (string), used as values (number) by default
const ENUM_KEYS = [
    'InputScriptType',
    'OutputScriptType',
    'RequestType',
    'BackupType',
    'Capability',
    'SafetyCheckLevel',
    'ButtonRequestType',
    'PinMatrixRequestType',
    'WordRequestType',
];

const parseEnumTypescript = item => {
    const value = [];
    const IS_KEY = ENUM_KEYS.includes(item.name);
    // declare enum
    if (IS_KEY) {
        value.push(`export enum Enum_${item.name} {`);
    } else {
        value.push(`export enum ${item.name} {`);
    }

    // declare fields
    item.values.forEach(field => {
        value.push(`    ${field.name} = ${field.id},`);
    });
    // close enum declaration
    value.push('}');

    if (IS_KEY) {
        value.push(`export type ${item.name} = keyof typeof Enum_${item.name};`);
    }
    // empty line
    value.push('');

    types.push({
        type: 'enum',
        name: item.name,
        value: value.join('\n'),
    });
};

const parseEnum = item => {
    if (isTypescript) return parseEnumTypescript(item);
    const value = [];
    // declare enum
    value.push(`export const Enum_${item.name} = Object.freeze({`);
    // declare fields
    item.values.forEach(field => {
        value.push(`    ${field.name}: ${field.id},`);
    });
    // close enum declaration
    value.push('});');
    // declare enum type using Keys or Values
    const KEY = ENUM_KEYS.includes(item.name) ? 'Keys' : 'Values';
    value.push(`export type ${item.name} = $${KEY}<typeof Enum_${item.name}>;`);
    // empty line
    value.push('');

    types.push({
        type: 'enum',
        name: item.name,
        value: value.join('\n'),
    });
};

const parseMessage = (message, depth = 0) => {
    if (!message.name) return;

    const value = [];
    // add comment line
    if (!depth) value.push(`// ${message.name}`);
    // declare nested enums
    if (message.enums) {
        message.enums.forEach(e => parseEnum(e));
    }
    // declare nested values
    if (message.messages) {
        message.messages.forEach(item => parseMessage(item, depth + 1));
    }
    if (!message.fields.length) {
        // few types are just empty objects, make it one line
        value.push(`export type ${message.name} = {};`);
        value.push('');
    } else {
        // find patch
        const definition = DEFINITION_PATCH[message.name];
        if (definition) {
            // replace whole declaration
            if (isTypescript) {
                // replace flowtype exact declaration {| ...type |} to typescript { ...type }
                let cleanTS = definition.replace(/{\|/gi, '{').replace(/\|}/gi, '}');
                // comment out flowtype Exclude type/helper (typescript build-in)
                if (cleanTS.indexOf('type Exclude') >= 0) {
                    cleanTS = cleanTS.replace('type Exclude', '// type Exclude');
                }
                value.push(cleanTS);
            } else {
                value.push(definition);
            }
        } else {
            // declare type
            value.push(`export type ${message.name} = {`);
            message.fields.forEach(field => {
                const fieldKey = `${message.name}.${field.name}`;
                // find patch for "rule"
                const fieldRule = RULE_PATCH[fieldKey] || field.rule;
                const rule = fieldRule === 'optional' ? '?: ' : ': ';
                // find patch for "type"
                let type = TYPE_PATCH[fieldKey] || FIELD_TYPES[field.type] || field.type;
                // array
                if (field.rule === 'repeated') {
                    type = type.split('|').length > 1 ? `Array<${type}>` : `${type}[]`;
                }
                value.push(`    ${field.name}${rule}${type};`);
            });
            // close type declaration
            value.push('};');
            // empty line
            value.push('');
        }
    }
    // type doest have to be e
    const exact = message.fields.find(f => f.rule === 'required');
    types.push({
        type: 'message',
        name: message.name,
        value: value.join('\n'),
        exact,
    });
};

// top level enums
json.enums.map(e => parseEnum(e));
// top level messages and nested messages
json.messages.map(e => parseMessage(e));

// types needs reordering (used before defined)
const ORDER = {
    BinanceCoin: 'BinanceInputOutput',
    HDNodeType: 'HDNodePathType',
    CardanoAssetGroupType: 'CardanoTxOutputType',
    CardanoTokenType: 'CardanoAssetGroupType',
    TxAck: 'TxAckInputWrapper',
};
Object.keys(ORDER).forEach(key => {
    // find indexes
    const indexA = types.findIndex(t => t && t.name === key);
    const indexB = types.findIndex(t => t && t.name === ORDER[key]);
    const prevA = types[indexA];
    // replace values
    delete types[indexA];
    types.splice(indexB, 0, prevA);
});

// skip not needed types
SKIP.forEach(key => {
    const index = types.findIndex(t => t && t.name === key);
    delete types[index];
});

// create content from types
const content = types.flatMap(t => (t ? [t.value] : [])).join('\n');

const lines = []; // string[]
if (!isTypescript) lines.push('// @flow');
lines.push('// This file is auto generated from data/messages/message.json');
lines.push(content);

// create custom definition
if (!isTypescript) {
    lines.push('// custom connect definitions');
    lines.push('export type MessageType = {');
    types
        .flatMap(t => (t && t.type === 'message' ? [t] : []))
        .forEach(t => {
            if (t.exact) {
                lines.push(`    ${t.name}: $Exact<${t.name}>;`);
            } else {
                lines.push(`    ${t.name}: ${t.name};`);
            }
            // lines.push('    ' + t.name + ': $Exact<' + t.name + '>;');
        });
    lines.push('};');

    // additional types utilities
    lines.push(`
export type MessageKey = $Keys<MessageType>;

export type MessageResponse<T: MessageKey> = {
    type: T;
    message: $ElementType<MessageType, T>;
};

export type TypedCall = <T: MessageKey, R: MessageKey>(
    type: T,
    resType: R,
    message?: $ElementType<MessageType, T>
) => Promise<MessageResponse<R>>;
`);
}

// save to file
const filePath = isTypescript
    ? 'src/ts/types/trezor/protobuf.d.ts'
    : 'src/js/types/trezor/protobuf.js';
fs.writeFile(filePath, lines.join('\n'), err => {
    if (err) return console.log(err);
});
