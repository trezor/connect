/* @flow */

import AbstractMethod from './AbstractMethod';
import { getFirmwareRange, validateParams } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import type { CoreMessage } from '../../types';
import type { CardanoNativeScript } from '../../types/networks/cardano';
import type {
    CardanoGetNativeScriptHash as CardanoGetNativeScriptHashProto,
    CardanoNativeScript as CardanoNativeScriptProto,
} from '../../types/trezor/protobuf';

type Params = CardanoGetNativeScriptHashProto;

export default class CardanoGetNativeScriptHash extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.firmwareRange = getFirmwareRange(
            this.name,
            getMiscNetwork('Cardano'),
            this.firmwareRange,
        );
        this.info = 'Get Cardano native script hash';

        const { payload } = message;

        validateParams(payload, [
            { name: 'script', type: 'object', obligatory: true },
            { name: 'displayFormat', type: 'number', obligatory: true },
        ]);

        this.validateScript(payload.script);

        this.params = {
            script: this.scriptToProto(payload.script),
            display_format: payload.displayFormat,
        };
    }

    validateScript(script: CardanoNativeScript) {
        validateParams(script, [
            { name: 'type', type: 'number', obligatory: true },
            { name: 'scripts', type: 'array', allowEmpty: true },
            { name: 'keyHash', type: 'string' },
            { name: 'requiredSignaturesCount', type: 'number' },
            { name: 'invalidBefore', type: 'amount' },
            { name: 'invalidHereafter', type: 'amount' },
        ]);

        if (script.keyPath) {
            validatePath(script.keyPath, 3);
        }

        if (script.scripts) {
            script.scripts.forEach(nestedScript => {
                this.validateScript(nestedScript);
            });
        }
    }

    scriptToProto(script: CardanoNativeScript): CardanoNativeScriptProto {
        let scripts = [];
        if (script.scripts) {
            scripts = script.scripts.map(nestedScript => this.scriptToProto(nestedScript));
        }
        let keyPath = [];
        if (script.keyPath) {
            keyPath = validatePath(script.keyPath, 3);
        }
        return {
            type: script.type,
            scripts,
            key_hash: script.keyHash,
            key_path: keyPath,
            required_signatures_count: script.requiredSignaturesCount,
            invalid_before: script.invalidBefore,
            invalid_hereafter: script.invalidHereafter,
        };
    }

    async run() {
        const { message } = await this.device
            .getCommands()
            .typedCall('CardanoGetNativeScriptHash', 'CardanoNativeScriptHash', {
                script: this.params.script,
                display_format: this.params.display_format,
            });

        return {
            scriptHash: message.script_hash,
        };
    }
}
