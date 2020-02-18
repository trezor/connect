/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath, getLabel } from '../../utils/pathUtils';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import type { MessageSignature } from '../../types/trezor/protobuf';
import type { CoreMessage, BitcoinNetworkInfo } from '../../types';
import { messageToHex } from '../../utils/formatUtils';

type Params = {
    path: Array<number>;
    message: string;
    coinInfo: ?BitcoinNetworkInfo;
}

export default class SignMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'coin', type: 'string' },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const path: Array<number> = validatePath(payload.path);
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

        const messageHex: string = payload.hex ? messageToHex(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
        this.params = {
            path,
            message: messageHex,
            coinInfo,
        };
    }

    async run(): Promise<MessageSignature> {
        const response: MessageSignature = await this.device.getCommands().signMessage(
            this.params.path,
            this.params.message,
            this.params.coinInfo ? this.params.coinInfo.name : null
        );

        // convert signature to base64
        const signatureBuffer = Buffer.from(response.signature, 'hex');
        response.signature = signatureBuffer.toString('base64');
        return response;
    }
}
