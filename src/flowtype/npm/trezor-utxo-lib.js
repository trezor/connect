/* @flow */

declare module '@trezor/utxo-lib' {
    declare type Network = {
        messagePrefix: string,
        bech32: string,
        bip32: {
            public: number,
            private: number,
        },
        pubKeyHash: number,
        scriptHash: number,
        wif: number,
        consensusBranchId?: { [version: number]: number },
        forkId?: number,
    }

    declare type TxOutput = {
        script: Buffer,
        value: string,
        decredVersion?: number,
    }

    declare type TxInput = {
        hash: Buffer,
        index: number,
        script: Buffer,
        sequence: number,
        witness: Buffer[],
        decredTree?: number,
        decredWitness?: {
            value: string,
            height: number,
            blockIndex: number,
            script: Buffer,
        },
    }

    declare type TransactionOptions = {
        nostrict?: boolean,
        network?: Network,
    }

    declare type TxSpecific = {
        type: 'dash',
        extraPayload?: Buffer,
    } | {
        type: 'zcash',
        versionGroupId?: number,
        // there is more but we are not using it
    }

    declare class Transaction {
        version: number,
        locktime: number,
        ins: TxInput[],
        outs: TxOutput[],
        specific?: TxSpecific,
        network: Network,
        type?: number,
        timestamp?: number,
        expiry?: number,
        constructor(options: TransactionOptions & { txSpecific?: TxSpecific }): Transaction,
        static fromHex(hex: string, options?: TransactionOptions): Transaction,
        static fromBuffer(buffer: Buffer, options?: TransactionOptions): Transaction,
        static isCoinbaseHash(buffer: Buffer): boolean,
        isCoinbase(): boolean,
        hasWitnesses(): boolean,
        weight(): number,
        virtualSize(): number,
        byteLength(_ALLOW_WITNESS?: boolean): number,
        getHash(forWitness?: boolean): Buffer,
        getId(): string,
        getExtraData(): Buffer | void,
        getSpecificData(): TxSpecific | void,
        toBuffer(buffer?: Buffer, initialOffset?: number, _ALLOW_WITNESS?: boolean): Buffer,
        toHex(): string,
    }

    declare var address: {
        fromBase58Check(address: string, network?: Network): { hash: Buffer, version: number },
        fromBech32(address: string): {data: Buffer, version: number, prefix: string},
        fromOutputScript(script: Buffer, network?: Network): string,
        toBase58Check(hash: Buffer, version: number): string,
        toOutputScript(address: string, network?: Network): Buffer,
    }

    declare interface BufferWriterInterface {
        buffer: Buffer,
        offset: number,
        // constructor(buffer: Buffer, offset?: number): BufferWriterC,
        writeUInt8(i: number): void,
        writeUInt16(i: number): void,
        writeInt32(i: number): void,
        writeUInt32(i: number): void,
        writeInt64(i: number): void,
        writeUInt64(i: number | string): void,
        writeVarInt(i: number): void,
        writeSlice(slice: Buffer): void,
        writeVarSlice(slice: Buffer): void,
        writeVector(vector: Buffer[]): void,
    }
    
    declare interface BufferReaderInterface {
        buffer: Buffer,
        offset: number,
        readUInt8(): number,
        readUInt16(): number,
        readInt32(): number,
        readUInt32(): number,
        readInt64(): number,
        readUInt64(): number,
        readUInt64String(): string,
        readVarInt(): number,
        readSlice(n: number): Buffer,
        readVarSlice(): Buffer,
        readVector(): Buffer[],
    }

    declare var bufferutils: {
        BufferWriter: (buffer: Buffer, offset?: number) => BufferWriterInterface,
        BufferReader: (buffer: Buffer, offset?: number) => BufferReaderInterface,
    }

    declare type Payment = {
        name?: string,
        network?: Network,
        output?: Buffer,
        data?: Buffer[],
        m?: number,
        n?: number,
        pubkeys?: Buffer[],
        input?: Buffer,
        signatures?: Buffer[],
        pubkey?: Buffer,
        signature?: Buffer,
        address?: string,
        hash?: Buffer,
        redeem?: Payment,
        witness?: Buffer[],
        scripts?: Buffer[],
        weights?: number[],
        amount?: string,
    }

    declare type PaymentOpts = {
        validate?: boolean,
        allowIncomplete?: boolean,
    }

    declare type PaymentCreator = (a: Payment, opts?: PaymentOpts) => Payment;

    declare var payments: {
        embed: PaymentCreator,
        p2ms: PaymentCreator,
        p2pk: PaymentCreator,
        p2pkh: PaymentCreator,
        p2sh: PaymentCreator,
        p2tr: PaymentCreator,
        p2wpkh: PaymentCreator,
        p2wsh: PaymentCreator,
        sstxchange: PaymentCreator,
        sstxcommitment: PaymentCreator,
        sstxpkh: PaymentCreator,
        sstxsh: PaymentCreator,
    }

    declare type Stack = Array<Buffer | number>;

    declare var script: {
        isPushOnly(value: Stack): boolean,
        compile(chunks: Buffer | Stack): Buffer,
        decompile(buffer: Buffer | Stack): types.Stack,
        toASM(chunks: Buffer | Stack): string,
        fromASM(asm: string): Buffer,
        toStack(chunks0: Buffer | Stack): Buffer[],
        isCanonicalPubKey(buffer: Buffer): any,
        isDefinedHashType(hashType: number): boolean,
        isCanonicalScriptSignature(buffer: Buffer): boolean,
    }

    declare var crypto: {
        blake256(buffer: Buffer): Buffer,
        sha1(buffer: Buffer): Buffer,
        sha256(buffer: Buffer): Buffer,
        hash256(buffer: Buffer): Buffer,
        hash160(buffer: Buffer): Buffer,
        hash160blake256(buffer: Buffer): Buffer,
        ripemd160(buffer: Buffer): Buffer,
    }

    declare var networks: {[key: string]: Network};

    declare type ComposeInput = {
        index: number,
        transactionHash: string,
        value: string,
        addressPath: [number, number],
        height?: number,
        coinbase: boolean,
        tsize: number,
        vsize: number,
        own: boolean,
        required?: boolean,
        confirmations?: number,
    }

    declare type ComposeFinalOutput = {
        type: 'complete',
        address: string,
        amount: string,
    } | {
        type: 'send-max',
        address: string,
    } | {
        type: 'opreturn',
        dataHex: string,
    }

    declare type ComposeNotFinalOutput = {
        type: 'send-max-noaddress',
    } | {
        type: 'noaddress',
        amount: string,
    }

    declare type ComposeOutput = ComposeFinalOutput | ComposeNotFinalOutput;

    declare type ComposeRequest = {
        utxos: ComposeInput[],
        outputs: ComposeOutput[],
        height: number,
        feeRate: string,
        segwit: boolean,
        inputAmounts: boolean,
        basePath: number[],
        network: Network,
        changeId: number,
        changeAddress: string,
        dustThreshold: number,
        baseFee?: number,
        floorBaseFee?: boolean,
        dustOutputFee?: number,
        skipUtxoSelection?: boolean,
    }

    declare type ComposedTxInput = {
        hash: Buffer,
        index: number,
        path: number[],
        segwit: boolean,
        amount?: string,
    }

    declare type ComposedTxOutput = {|
        path: number[],
        value: string,
        segwit: boolean,
    |} | {|
        address: string,
        value: string,
    |} | {|
        opReturnData: Buffer,
        value?: typeof undefined,
    |}

    declare class Permutation<X> {
        sorted: X[],
        permutation: number[],
        constructor(sorted: X[], permutation: number[]): Permutation<X>;
        static fromFunction<Y>(original: Y[], sort: (a: Y, b: Y) => number): Permutation<Y>,
        forEach(fn: (originalIx: number, sortedIx: number) => void): void,
        map<Y>(fn: (p: X) => Y): Permutation<Y>,
    }

    declare type ComposedTransaction = {
        inputs: ComposedTxInput[],
        outputs: Permutation<ComposedTxOutput>,
    }

    declare type ComposeResult = {
        type: 'error',
        error: string,
    } | {
        type: 'nonfinal',
        max?: string,
        totalSpent: string,
        fee: string,
        feePerByte: string,
        bytes: number,
    } | {
        type: 'final',
        max?: string,
        totalSpent: string,
        fee: string,
        feePerByte: string,
        bytes: number,
        transaction: ComposedTransaction,
    }

    declare var composeTx: (request: ComposeRequest) => ComposeResult;

    declare interface BIP32Interface {
        chainCode: Buffer,
        network: Network,
        lowR: boolean,
        depth: number,
        index: number,
        parentFingerprint: number,
        publicKey: Buffer,
        privateKey?: Buffer,
        identifier: Buffer,
        fingerprint: Buffer,
        isNeutered(): boolean,
        neutered(): BIP32Interface,
        toBase58(): string,
        toWIF(): string,
        derive(index: number): BIP32Interface,
        deriveHardened(index: number): BIP32Interface,
        derivePath(path: string): BIP32Interface,
        sign(hash: Buffer, lowR?: boolean): Buffer,
        verify(hash: Buffer, signature: Buffer): boolean,
        // private fields overriden in hdnodeUtils
        __DEPTH: number,
        __INDEX: number,
        __PARENT_FINGERPRINT: number,
    }

    declare var bip32: {
        fromPrivateKey(privateKey: Buffer, chainCode: Buffer, network?: Network): BIP32Interface;
        fromPublicKey(publicKey: Buffer, chainCode: Buffer, network?: Network): BIP32Interface;
        fromSeed(seed: Buffer, network?: Network): BIP32Interface;
        fromBase58(inString: string, network?: Network): BIP32Interface;
    };
}
