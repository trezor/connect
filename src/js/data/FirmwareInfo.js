/* @flow */

import { getInfo } from '@trezor/rollout';
import type { DeviceFirmwareStatus, FirmwareRelease, Features } from '../types';

const releases = {
    1: [],
    2: [],
};

export const parseFirmware = (json: JSON, model): void => {
    const obj: Object = json;
    Object.keys(obj).forEach(key => {
        const release = obj[key];
        releases[model].push({ ...release });
    });
};

export const checkFirmware = (features: Features): DeviceFirmwareStatus => {
    // indication that firmware is not installed at all. This information is set to false in bl mode. Otherwise it is null.
    if (features.firmware_present === false) {
        return 'none';
    }
    // // for t1 in bootloader, what device reports as firmware version is in fact bootloader version, so we can
    // // not safely tell firmware version
    if (features.major_version === 1 && features.bootloader_mode) {
        return 'unknown';
    }
    const info = getInfo({features, releases: releases[features.major_version]});
    // no info means there is nothing that might be installed upon this firmware
    if (!info) return 'valid';

    if (info.isRequired) {
        return 'required';
    }
    return 'outdated';
};

export const getLatestRelease = (features: Features): ?FirmwareRelease => {
    return getInfo({features, releases: releases[features.major_version]});
};
