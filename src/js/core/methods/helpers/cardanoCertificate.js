/* @flow */

import { validateParams } from './paramsValidator';
import {
    Enum_CardanoCertificateType as CardanoCertificateType,
    Enum_CardanoPoolRelayType as CardanoPoolRelayType,
} from '../../../types/trezor/protobuf';
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
    CardanoPoolOwner as CardanoPoolOwnerProto,
    CardanoPoolRelayParameters as CardanoPoolRelayProto,
} from '../../../types/trezor/protobuf';

const ipv4AddressToHex = (ipv4Address: string) =>
    Buffer.from(ipv4Address.split('.').map(ipPart => parseInt(ipPart, 10))).toString('hex');

const ipv6AddressToHex = (ipv6Address: string) => ipv6Address.split(':').join('');

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
    validateParams(relay, [{ name: 'type', type: 'number', obligatory: true }]);

    if (relay.type === CardanoPoolRelayType.SINGLE_HOST_IP) {
        const paramsToValidate = [{ name: 'port', type: 'number', obligatory: true }];
        if (relay.ipv4Address) {
            paramsToValidate.push({ name: 'ipv4Address', type: 'string' });
        }
        if (relay.ipv6Address) {
            paramsToValidate.push({ name: 'ipv6Address', type: 'string' });
        }

        validateParams(relay, paramsToValidate);

        if (!relay.ipv4Address && !relay.ipv6Address) {
            throw ERRORS.TypedError(
                'Method_InvalidParameter',
                'Either ipv4Address or ipv6Address must be supplied',
            );
        }
    } else if (relay.type === CardanoPoolRelayType.SINGLE_HOST_NAME) {
        validateParams(relay, [
            { name: 'hostName', type: 'string', obligatory: true },
            { name: 'port', type: 'number', obligatory: true },
        ]);
    } else if (relay.type === CardanoPoolRelayType.MULTIPLE_HOST_NAME) {
        validateParams(relay, [{ name: 'hostName', type: 'string', obligatory: true }]);
    }
};

const validatePoolOwners = (owners: CardanoPoolOwner[]) => {
    owners.forEach(owner => {
        if (owner.stakingKeyHash) {
            validateParams(owner, [
                { name: 'stakingKeyHash', type: 'string', obligatory: !owner.stakingKeyPath },
            ]);
        }

        if (owner.stakingKeyPath) {
            validatePath(owner.stakingKeyPath, 5);
        }

        if (!owner.stakingKeyHash && !owner.stakingKeyPath) {
            throw ERRORS.TypedError(
                'Method_InvalidParameter',
                'Either stakingKeyHash or stakingKeyPath must be supplied',
            );
        }
    });

    const ownersAsPathCount = owners.filter(owner => !!owner.stakingKeyPath).length;
    if (ownersAsPathCount !== 1) {
        throw ERRORS.TypedError(
            'Method_InvalidParameter',
            'Exactly one pool owner must be given as a path',
        );
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

export type CertificateWithPoolOwnersAndRelays = {
    certificate: CardanoTxCertificateType,
    poolOwners: CardanoPoolOwnerProto[],
    poolRelays: CardanoPoolRelayProto[],
};

export type PoolParametersWithOwnersAndRelays = {
    poolParameters?: CardanoPoolParametersType,
    poolOwners: CardanoPoolOwnerProto[],
    poolRelays: CardanoPoolRelayProto[],
};

const transformPoolParameters = (
    poolParameters?: CardanoPoolParameters,
): PoolParametersWithOwnersAndRelays => {
    if (!poolParameters) {
        return { poolParameters: undefined, poolOwners: [], poolRelays: [] };
    }

    validatePoolParameters(poolParameters);

    return {
        poolParameters: {
            pool_id: poolParameters.poolId,
            vrf_key_hash: poolParameters.vrfKeyHash,
            pledge: poolParameters.pledge,
            cost: poolParameters.cost,
            margin_numerator: poolParameters.margin.numerator,
            margin_denominator: poolParameters.margin.denominator,
            reward_account: poolParameters.rewardAccount,
            owners: [], // required for wire compatibility with legacy FW
            relays: [], // required for wire compatibility with legacy FW
            metadata: poolParameters.metadata,
            owners_count: poolParameters.owners.length,
            relays_count: poolParameters.relays.length,
        },
        poolOwners: poolParameters.owners.map(owner => ({
            staking_key_hash: owner.stakingKeyHash,
            staking_key_path: owner.stakingKeyPath
                ? validatePath(owner.stakingKeyPath, 5)
                : undefined,
        })),
        poolRelays: poolParameters.relays.map(relay => ({
            type: relay.type,
            ipv4_address: relay.ipv4Address ? ipv4AddressToHex(relay.ipv4Address) : undefined,
            ipv6_address: relay.ipv6Address ? ipv6AddressToHex(relay.ipv6Address) : undefined,
            host_name: relay.hostName,
            port: relay.port,
        })),
    };
};

// transform incoming certificate object to protobuf messages format
export const transformCertificate = (
    certificate: CardanoCertificate,
): CertificateWithPoolOwnersAndRelays => {
    const paramsToValidate = [{ name: 'type', type: 'number', obligatory: true }];

    if (certificate.type !== CardanoCertificateType.STAKE_POOL_REGISTRATION) {
        paramsToValidate.push({ name: 'path', obligatory: true });
    }

    if (certificate.type === CardanoCertificateType.STAKE_DELEGATION) {
        paramsToValidate.push({ name: 'pool', type: 'string', obligatory: true });
    }

    if (certificate.type === CardanoCertificateType.STAKE_POOL_REGISTRATION) {
        paramsToValidate.push({ name: 'poolParameters', type: 'object', obligatory: true });
    }

    validateParams(certificate, paramsToValidate);

    const { poolParameters, poolOwners, poolRelays } = transformPoolParameters(
        certificate.poolParameters,
    );

    return {
        certificate: {
            type: certificate.type,
            path: certificate.path ? validatePath(certificate.path, 5) : undefined,
            pool: certificate.pool,
            pool_parameters: poolParameters,
        },
        poolOwners,
        poolRelays,
    };
};
