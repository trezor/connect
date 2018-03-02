/* @flow */
'use strict';

// react sometimes adds some other parameters that should not be there
export default function (obj: Object, firmware: any) {
    if (typeof firmware === 'string') {
        obj.requiredFirmware = firmware;
    }
    return obj;
}
