/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath, getScriptType, getSerializedPath } from '../../utils/pathUtils';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import type { MessageType } from '../../types/trezor/protobuf';
import type { OwnershipProof } from '../../types/networks/bitcoin';

type Params = {
    ...$ElementType<MessageType, 'GetOwnershipProof'>,
    preauthorized: boolean,
};

export default class GetOwnershipProof extends AbstractMethod<'getOwnershipProof'> {
    params: Params[] = [];

    hasBundle: boolean;

    confirmed: ?boolean;

    init() {
        this.requiredPermissions = ['read'];
        this.info = 'Export ownership proof';

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
                { name: 'scriptType', type: 'string' },
                { name: 'multisig', type: 'object' },
                { name: 'userConfirmation', type: 'boolean' },
                { name: 'ownershipIds', type: 'array' },
                { name: 'commitmentData', type: 'string' },
            ]);

            const address_n = validatePath(batch.path, 3);
            const coinInfo = getBitcoinNetwork(batch.coin || address_n);
            const script_type = batch.scriptType || getScriptType(address_n);
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);

            this.params.push({
                address_n,
                coin_name: coinInfo ? coinInfo.name : undefined,
                script_type,
                multisig: batch.multisig,
                user_confirmation: batch.userConfirmation,
                ownership_ids: batch.ownershipIds,
                commitment_data: batch.commitmentData,
                preauthorized: !!batch.preauthorized,
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
            label = 'Export multiple ownership proofs';
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
        const responses: OwnershipProof[] = [];
        const cmd = this.device.getCommands();
        for (let i = 0; i < this.params.length; i++) {
            const batch = this.params[i];
            if (batch.preauthorized) {
                await cmd.typedCall('DoPreauthorized', 'PreauthorizedRequest', {});
            }
            const { message } = await cmd.typedCall('GetOwnershipProof', 'OwnershipProof', batch);
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
