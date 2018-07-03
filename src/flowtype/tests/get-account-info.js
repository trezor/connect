/* @flowtype */

import type { AccountInfo } from "flowtype/trezor";

declare module 'flowtype/tests/get-account-info' {
    declare export type TestGetAccountInfoPayload = {
        path: ?Array<number>,
        xpub: ?string,
        coin: string,
    };

    declare export type ExpectedGetAccountInfoResponse = AccountInfo | { error: string };
}
