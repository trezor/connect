/* @flow */

type AvailableTests =
    | 'getPublicKey'
    | 'getAddress'
    | 'getAddressSegwit'
    | 'signMessage'
    | 'signMessageSegwit'
    | 'signTx'
    | 'signTxSegwit'
    | 'signTxBgold'
    | 'signTxBcash'
    | 'verifyMessage'
    | 'verifyMessageSegwit'
    | 'ethereumGetAddress'
    | 'ethereumSignMessage'
    | 'ethereumSignTx'
    | 'ethereumVerifyMessage'
    | 'nemGetAddress';

declare var __karma__: {
    config: {
        test: AvailableTests,
        subtest: string,
    },
};
