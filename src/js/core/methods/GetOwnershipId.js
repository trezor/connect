/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath, getScriptType, getSerializedPath } from '../../utils/pathUtils';
import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import type { MessageType } from '../../types/trezor/protobuf';
import type { OwnershipId } from '../../types/networks/bitcoin';

type Params = $ElementType<MessageType, 'GetOwnershipId'>;

export default class GetOwnershipId extends AbstractMethod<'getOwnershipId'> {
    params: Params[] = [];

    hasBundle: boolean;

    confirmed: ?boolean;

    init() {
        this.requiredPermissions = ['read'];
        this.info = 'Export ownership id';

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = !!this.payload.bundle;
        const payload = !this.payload.bundle
            ? { ...this.payload, bundle: [this.payload] }
            : this.payload;

        // validate bundle type
        validateParams(payload, [{ name: 'bundle', type: 'array' }]);

        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', required: true },
                { name: 'coin', type: 'string' },
                { name: 'multisig', type: 'object' },
                { name: 'scriptType', type: 'string' },
            ]);

            const address_n = validatePath(batch.path, 1);
            const coinInfo = getBitcoinNetwork(batch.coin || address_n);
            const script_type = batch.scriptType || getScriptType(address_n);
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);

            this.params.push({
                address_n,
                coin_name: coinInfo ? coinInfo.name : undefined,
                multisig: batch.multisig,
                script_type,
            });
        });
    }

    async confirmation() {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);
        let label = this.info;
        if (this.params.length > 1) {
            label = 'Export multiple ownership proof ids';
        }

        // request confirmation view
        this.postMessage(
            UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'export-address',
                label,
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run() {
        const responses: OwnershipId[] = [];
        const cmd = this.device.getCommands();
        for (let i = 0; i < this.params.length; i++) {
            const batch = this.params[i];
            const { message } = await cmd.typedCall('GetOwnershipId', 'OwnershipId', batch);
            responses.push({
                ...message,
                path: batch.address_n,
                serializedPath: getSerializedPath(batch.address_n),
            });

            if (this.hasBundle) {
                // send progress
                this.postMessage(
                    UiMessage(UI.BUNDLE_PROGRESS, {
                        progress: i,
                        response: message,
                    }),
                );
            }
        }
        return this.hasBundle ? responses : responses[0];
    }
}
