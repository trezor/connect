/* @flow */
'use strict';

type Release = {
    required: true,
    version: Array<number>,
    min_bridge_version: Array<number>,
    url: string,
    fingerprint: string,
    changelog: string,
    notes: string
};

const releases: Array<Release> = [];

export const parseFirmware = (json: JSON): void => {
    const obj: Object = json;
    Object.keys(obj).forEach(key => {
        const release = obj[key];
        releases.push({ ...release });
    });
}

export const checkFirmware = (fw: Array<number>): void => {
    // find all releases for device model
    const major: Array<Release> = releases.filter(r => r.version[0] === fw[0]);
    // find new firmware
    const newFirmware: Array<Release> = releases.filter(r => r.version[1] > fw[1] || (r.version[1] === fw[1] && r.version[2] > fw[2]) );

    // check if any of releases is required
    if (newFirmware.length > 0) {
        const isRequired: ?Release = newFirmware.find(r => r.required);
        if (isRequired) {
            // TODO:
        }
    }
}
