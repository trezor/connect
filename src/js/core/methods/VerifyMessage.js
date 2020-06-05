/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import { getLabel } from '../../utils/pathUtils';
import { ERRORS } from '../../constants';

import type { Success } from '../../types/trezor/protobuf';
import type { CoreMessage, BitcoinNetworkInfo } from '../../types';
import { messageToHex } from '../../utils/formatUtils';

type Params = {
    address: string;
    signature: string;
    message: string;
    coinInfo: BitcoinNetworkInfo;
}

export default class VerifyMessage extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.info = 'Verify message';

        const payload: Object = message.payload;

        // validate incoming parameters for each batch
        validateParams(payload, [
            { name: 'address', type: 'string', obligatory: true },
            { name: 'signature', type: 'string', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const coinInfo: ?BitcoinNetworkInfo = getBitcoinNetwork(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        } else {
            // check required firmware with coinInfo support
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
            this.info = getLabel('Verify #NETWORK message', coinInfo);
        }
        const messageHex: string = payload.hex ? messageToHex(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
        const signatureHex: string = Buffer.from(payload.signature, 'base64').toString('hex');

        this.params = {
            address: payload.address,
            signature: signatureHex,
            message: messageHex,
            coinInfo,
        };
    }

    async run(): Promise<Success> {
        return await this.device.getCommands().verifyMessage(
            this.params.address,
            this.params.signature,
            this.params.message,
            this.params.coinInfo.name
        );
    }
}
