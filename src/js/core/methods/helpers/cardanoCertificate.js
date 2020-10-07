/* @flow */

import { validateParams } from './paramsValidator';
import { CERTIFICATE_TYPE, POOL_RELAY_TYPE } from '../../../constants/cardano';
import { validatePath } from '../../../utils/pathUtils';
import { ERRORS } from '../../../constants';

import type {
    CardanoCertificate,
    CardanoPoolParameters,
    CardanoPoolMargin,
    CardanoPoolOwner,
    CardanoPoolRelay,
    CardanoPoolMetadata,
} from '../../../types/networks/cardano';

import type {
    CardanoTxCertificateType,
    CardanoPoolParametersType,
    CardanoPoolOwnerType,
    CardanoPoolRelayParametersType,
} from '../../../types/trezor/protobuf';

const ipv4AddressToHex = (ipv4Address: string): string => {
    return Buffer.from(ipv4Address.split('.').map((ipPart) => parseInt(ipPart))).toString('hex');
};

const ipv6AddressToHex = (ipv6Address: string): string => {
    return ipv6Address.split(':').join('');
};

const validatePoolMargin = (margin: CardanoPoolMargin) => {
    validateParams(margin, [
        { name: 'numerator', type: 'string', obligatory: true },
        { name: 'denominator', type: 'string', obligatory: true },
    ]);
};

const validatePoolMetadata = (metadata: CardanoPoolMetadata) => {
    validateParams(metadata, [
        { name: 'url', type: 'string', obligatory: true },
        { name: 'hash', type: 'string', obligatory: true },
    ]);
};

const validatePoolRelay = (relay: CardanoPoolRelay) => {
    validateParams(relay, [
        { name: 'type', type: 'number', obligatory: true },
    ]);

    if (relay.type === POOL_RELAY_TYPE.SingleHostIp) {
        const paramsToValidate = [
            { name: 'port', type: 'number', obligatory: true },
        ];
        if (relay.ipv4Address) {
            paramsToValidate.push({ name: 'ipv4Address', type: 'string' });
        }
        if (relay.ipv6Address) {
            paramsToValidate.push({ name: 'ipv6Address', type: 'string' });
        }

        validateParams(relay, paramsToValidate);

        if (!relay.ipv4Address && !relay.ipv6Address) {
            throw ERRORS.TypedError('Method_InvalidParameter', 'Either ipv4Address or ipv6Address must be supplied');
        }
    } else if (relay.type === POOL_RELAY_TYPE.SingleHostName) {
        validateParams(relay, [
            { name: 'hostName', type: 'string', obligatory: true },
            { name: 'port', type: 'number', obligatory: true },
        ]);
    } else if (POOL_RELAY_TYPE.MultipleHostName) {
        validateParams(relay, [
            { name: 'hostName', type: 'string', obligatory: true },
        ]);
    }
};

const validatePoolOwners = (owners: Array<CardanoPoolOwner>) => {
    owners.forEach((owner) => {
        if (owner.stakingKeyHash) {
            validateParams(owner, [
                { name: 'stakingKeyHash', type: 'string', obligatory: !owner.stakingKeyPath },
            ]);
        }

        if (owner.stakingKeyPath) {
            validatePath(owner.stakingKeyPath, 5);
        }

        if (!owner.stakingKeyHash && !owner.stakingKeyPath) {
            throw ERRORS.TypedError('Method_InvalidParameter', 'Either stakingKeyHash or stakingKeyPath must be supplied');
        }
    });

    const ownersAsPathCount = owners.filter(owner => !!owner.stakingKeyPath).length;
    if (ownersAsPathCount !== 1) {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Exactly one pool owner must be given as a path');
    }
};

const validatePoolParameters = (poolParameters: CardanoPoolParameters) => {
    validateParams(poolParameters, [
        { name: 'poolId', type: 'string', obligatory: true },
        { name: 'vrfKeyHash', type: 'string', obligatory: true },
        { name: 'pledge', type: 'string', obligatory: true },
        { name: 'cost', type: 'string', obligatory: true },
        { name: 'margin', type: 'object', obligatory: true },
        { name: 'rewardAccount', type: 'string', obligatory: true },
        { name: 'owners', type: 'array', obligatory: true },
        { name: 'relays', type: 'array', obligatory: true, allowEmpty: true },
        { name: 'metadata', type: 'object' },
    ]);

    validatePoolMargin(poolParameters.margin);
    validatePoolOwners(poolParameters.owners);
    poolParameters.relays.forEach(validatePoolRelay);

    if (poolParameters.metadata) {
        validatePoolMetadata(poolParameters.metadata);
    }
};

const transformPoolParameters = (poolParameters: CardanoPoolParameters): CardanoPoolParametersType => {
    validatePoolParameters(poolParameters);

    return {
        pool_id: poolParameters.poolId,
        vrf_key_hash: poolParameters.vrfKeyHash,
        pledge: poolParameters.pledge,
        cost: poolParameters.cost,
        margin_numerator: poolParameters.margin.numerator,
        margin_denominator: poolParameters.margin.denominator,
        reward_account: poolParameters.rewardAccount,
        owners: poolParameters.owners.map((owner: CardanoPoolOwner): CardanoPoolOwnerType => {
            return {
                staking_key_hash: owner.stakingKeyHash,
                staking_key_path: owner.stakingKeyPath ? validatePath(owner.stakingKeyPath, 5) : undefined,
            };
        }),
        relays: poolParameters.relays.map((relay: CardanoPoolRelay): CardanoPoolRelayParametersType => {
            return {
                type: relay.type,
                ipv4_address: relay.ipv4Address ? ipv4AddressToHex(relay.ipv4Address) : undefined,
                ipv6_address: relay.ipv6Address ? ipv6AddressToHex(relay.ipv6Address) : undefined,
                host_name: relay.hostName,
                port: relay.port,
            };
        }),
        metadata: poolParameters.metadata,
    };
};

// transform incoming certificate object to protobuf messages format
export const transformCertificate = (certificate: CardanoCertificate): CardanoTxCertificateType => {
    const paramsToValidate = [
        { name: 'type', type: 'number', obligatory: true },
    ];

    if (certificate.type !== CERTIFICATE_TYPE.StakePoolRegistration) {
        paramsToValidate.push({ name: 'path', obligatory: true });
    }

    if (certificate.type === CERTIFICATE_TYPE.StakeDelegation) {
        paramsToValidate.push({ name: 'pool', type: 'string', obligatory: true });
    }

    if (certificate.type === CERTIFICATE_TYPE.StakePoolRegistration) {
        paramsToValidate.push({ name: 'poolParameters', type: 'object', obligatory: true });
    }

    validateParams(certificate, paramsToValidate);

    return {
        type: certificate.type,
        path: certificate.path ? validatePath(certificate.path, 5) : undefined,
        pool: certificate.pool,
        pool_parameters: certificate.poolParameters ? transformPoolParameters(certificate.poolParameters) : undefined,
    };
};
