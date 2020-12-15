/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath, getLabel, getScriptType } from '../../utils/pathUtils';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import { messageToHex } from '../../utils/formatUtils';
import type { CoreMessage, BitcoinNetworkInfo } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class SignMessage extends AbstractMethod {
    params: $ElementType<MessageType, 'SignMessage'>;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'coin', type: 'string' },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const path = validatePath(payload.path);
        let coinInfo: ?BitcoinNetworkInfo;
        if (payload.coin) {
            coinInfo = getBitcoinNetwork(payload.coin);
            validateCoinPath(coinInfo, path);
        } else {
            coinInfo = getBitcoinNetwork(path);
        }

        this.info = getLabel('Sign #NETWORK message', coinInfo);

        if (coinInfo) {
            // check required firmware with coinInfo support
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
        }

        const messageHex = payload.hex ? messageToHex(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
        const scriptType = getScriptType(path);
        this.params = {
            address_n: path,
            message: messageHex,
            coin_name: coinInfo ? coinInfo.name : undefined,
            script_type: scriptType && scriptType !== 'SPENDMULTISIG' ? scriptType : 'SPENDADDRESS', // script_type 'SPENDMULTISIG' throws Failure_FirmwareError
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const { message } = await cmd.typedCall('SignMessage', 'MessageSignature', this.params);
        // convert signature to base64
        const signatureBuffer = Buffer.from(message.signature, 'hex');
        message.signature = signatureBuffer.toString('base64');
        return message;
    }
}
