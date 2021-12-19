/* @flow */

import AbstractMethod from './AbstractMethod';
import { getFirmwareRange, validateParams } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import type { CardanoNativeScript } from '../../types/networks/cardano';
import type {
    CardanoNativeScript as CardanoNativeScriptProto,
    MessageType,
} from '../../types/trezor/protobuf';
import { Enum_CardanoDerivationType as CardanoDerivationType } from '../../types/trezor/protobuf';

type Params = $ElementType<MessageType, 'CardanoGetNativeScriptHash'>;
export default class CardanoGetNativeScriptHash extends AbstractMethod<'cardanoGetNativeScriptHash'> {
    params: Params;

    init() {
        this.requiredPermissions = ['read'];
        this.firmwareRange = getFirmwareRange(
            this.name,
            getMiscNetwork('Cardano'),
            this.firmwareRange,
        );
        this.info = 'Get Cardano native script hash';

        const { payload } = this;

        validateParams(payload, [
            { name: 'script', type: 'object', required: true },
            { name: 'displayFormat', type: 'number', required: true },
            { name: 'derivationType', type: 'number' },
        ]);

        this.validateScript(payload.script);

        this.params = {
            script: this.scriptToProto(payload.script),
            display_format: payload.displayFormat,
            derivation_type:
                typeof payload.derivationType !== 'undefined'
                    ? payload.derivationType
                    : CardanoDerivationType.ICARUS_TREZOR,
        };
    }

    validateScript(script: CardanoNativeScript) {
        validateParams(script, [
            { name: 'type', type: 'number', required: true },
            { name: 'scripts', type: 'array', allowEmpty: true },
            { name: 'keyHash', type: 'string' },
            { name: 'requiredSignaturesCount', type: 'number' },
            { name: 'invalidBefore', type: 'uint' },
            { name: 'invalidHereafter', type: 'uint' },
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
                derivation_type: this.params.derivation_type,
            });

        return {
            scriptHash: message.script_hash,
        };
    }
}
