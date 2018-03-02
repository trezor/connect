declare class TrezorConnectResponse {
    status: boolean;
    message: string;
    merkleRoot: Buffer;
    timestamp: number;
    bits: number;
    nonce: number;

    getHash(): Buffer;
    getId(): string;
    getUTCDate(): Date;
    toBuffer(headersOnly?: boolean): Buffer;
    toHex(headersOnly?: boolean): string;
    calculateTarget(bits: number): Buffer;
    checkProofOfWork(): boolean;
}

declare module CSSModule {
    declare var exports: { [key: string]: string };
}
