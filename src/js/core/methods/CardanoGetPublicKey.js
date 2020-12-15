/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath, fromHardened, getSerializedPath } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { CoreMessage } from '../../types';
import type { CardanoPublicKey } from '../../types/networks/cardano';
import type { MessageType } from '../../types/trezor/protobuf';

export default class CardanoGetPublicKey extends AbstractMethod {
    params: $ElementType<MessageType, 'TezosGetPublicKey'>[] = [];
    hasBundle: boolean;
    confirmed: ?boolean;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Cardano'), this.firmwareRange);
        this.info = 'Export Cardano public key';

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = Object.prototype.hasOwnProperty.call(message.payload, 'bundle');
        const payload = !this.hasBundle ? { ...message.payload, bundle: [ message.payload ] } : message.payload;

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
        ]);

        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', obligatory: true },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            const path = validatePath(batch.path, 3);
            let showOnTrezor = false;
            if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }

            this.params.push({
                address_n: path,
                show_display: showOnTrezor,
            });
        });
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        let label: string;
        if (this.params.length > 1) {
            label = 'Export multiple Cardano public keys';
        } else {
            label = `Export Cardano public key for account #${(fromHardened(this.params[0].address_n[2]) + 1)}`;
        }

        // request confirmation view
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-xpub',
            label,
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run() {
        const responses: CardanoPublicKey[] = [];
        const cmd = this.device.getCommands();
        for (let i = 0; i < this.params.length; i++) {
            const batch = this.params[i];
            const { message } = await cmd.typedCall('CardanoGetPublicKey', 'CardanoPublicKey', batch);
            responses.push({
                path: batch.address_n,
                serializedPath: getSerializedPath(batch.address_n),
                publicKey: message.xpub,
                node: message.node,
            });

            if (this.hasBundle) {
                // send progress
                this.postMessage(UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response: message,
                }));
            }
        }
        return this.hasBundle ? responses : responses[0];
    }
}
