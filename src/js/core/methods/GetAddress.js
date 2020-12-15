/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath, getLabel, getSerializedPath } from '../../utils/pathUtils';
import { getBitcoinNetwork, fixCoinInfoNetwork, getUniqueNetworks } from '../../data/CoinInfo';

import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';

import type { Address } from '../../types/networks/bitcoin';
import type { CoreMessage, BitcoinNetworkInfo } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

type Params = {
    ...$ElementType<MessageType, 'GetAddress'>,
    address?: string;
    coinInfo: BitcoinNetworkInfo;
};

export default class GetAddress extends AbstractMethod {
    params: Params[] = [];
    hasBundle: boolean;
    progress: number = 0;
    confirmed: ?boolean;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = Object.prototype.hasOwnProperty.call(message.payload, 'bundle');
        const payload = !this.hasBundle ? { ...message.payload, bundle: [ message.payload ] } : message.payload;

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
            { name: 'useEventListener', type: 'boolean' },
        ]);

        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', obligatory: true },
                { name: 'coin', type: 'string' },
                { name: 'address', type: 'string' },
                { name: 'showOnTrezor', type: 'boolean' },
                { name: 'multisig', type: 'object' },
                { name: 'scriptType', type: 'string' },
            ]);

            const path = validatePath(batch.path, 1);
            let coinInfo: ?BitcoinNetworkInfo;
            if (batch.coin) {
                coinInfo = getBitcoinNetwork(batch.coin);
            }

            if (coinInfo && !batch.crossChain) {
                validateCoinPath(coinInfo, path);
            } else if (!coinInfo) {
                coinInfo = getBitcoinNetwork(path);
            }

            let showOnTrezor = true;
            if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }

            if (!coinInfo) {
                throw ERRORS.TypedError('Method_UnknownCoin');
            } else if (coinInfo) {
                // set required firmware from coinInfo support
                this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
            }

            // fix coinInfo network values (segwit/legacy)
            coinInfo = fixCoinInfoNetwork(coinInfo, path);

            this.params.push({
                address_n: path,
                address: batch.address,
                show_display: showOnTrezor,
                multisig: batch.multisig,
                script_type: batch.scriptType,
                coinInfo,
            });
        });

        const useEventListener = payload.useEventListener && this.params.length === 1 && typeof this.params[0].address === 'string' && this.params[0].show_display;
        this.confirmed = useEventListener;
        this.useUi = !useEventListener;

        // set info
        if (this.params.length === 1) {
            this.info = getLabel('Export #NETWORK address', this.params[0].coinInfo);
        } else {
            const requestedNetworks = this.params.map(b => b.coinInfo);
            const uniqNetworks = getUniqueNetworks(requestedNetworks);
            if (uniqNetworks.length === 1 && uniqNetworks[0]) {
                this.info = getLabel('Export multiple #NETWORK addresses', uniqNetworks[0]);
            } else {
                this.info = 'Export multiple addresses';
            }
        }
    }

    getButtonRequestData(code: string) {
        if (code === 'ButtonRequest_Address') {
            const data = {
                type: 'address',
                serializedPath: getSerializedPath(this.params[this.progress].address_n),
                address: this.params[this.progress].address || 'not-set',
            };
            return data;
        }
        return null;
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-address',
            label: this.info,
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async noBackupConfirmation(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'no-backup',
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async _call({
        address_n,
        show_display,
        multisig,
        script_type,
        coinInfo,
    }: Params) {
        const cmd = this.device.getCommands();
        return cmd.getAddress({
            address_n,
            show_display,
            multisig,
            script_type,
        }, coinInfo);
    }

    async run() {
        const responses: Address[] = [];

        for (let i = 0; i < this.params.length; i++) {
            const batch = this.params[i];
            // silently get address and compare with requested address
            // or display as default inside popup
            if (batch.show_display) {
                const silent = await this._call({
                    ...batch,
                    show_display: false,
                });
                if (typeof batch.address === 'string') {
                    if (batch.address !== silent.address) {
                        throw ERRORS.TypedError('Method_AddressNotMatch');
                    }
                } else {
                    batch.address = silent.address;
                }
            }

            const response = await this._call(batch);
            responses.push(response);

            if (this.hasBundle) {
                // send progress
                this.postMessage(UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }

            this.progress++;
        }
        return this.hasBundle ? responses : responses[0];
    }
}
