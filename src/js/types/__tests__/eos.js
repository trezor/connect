/* @flow */
import TrezorConnect from '../../index';

export const eosGetPublicKey = async () => {
    // regular
    const singlePK = await TrezorConnect.eosGetPublicKey({ path: 'm/44' });
    (singlePK.success: boolean);
    if (singlePK.success) {
        const { payload } = singlePK;
        (payload.path: number[]);
        (payload.serializedPath: string);
        (payload.wifPublicKey: string);
        (payload.rawPublicKey: string);
        // $FlowIssue: payload is Address
        payload.forEach(item => {
            (item.path: string);
        });
    }

    // bundle
    const bundlePK = await TrezorConnect.eosGetPublicKey({ bundle: [{ path: 'm/44' }] });
    (bundlePK.success: boolean);
    if (bundlePK.success) {
        bundlePK.payload.forEach(item => {
            (item.path: number[]);
            (item.serializedPath: string);
            (item.wifPublicKey: string);
            (item.rawPublicKey: string);
        });
        // $FlowIssue: payload is Address[]
        (bundlePK.payload.path: string);
    } else {
        (bundlePK.payload.error: string);
    }
};

export const eosSignTransaction = async () => {
    const common = {
        account: 'eosio.token',
        authorization: [{
            actor: 'miniminimini',
            permission: 'active',
        }],
    };

    const sign = await TrezorConnect.eosSignTransaction({
        path: "m/44'/194'/0'/0/0",
        transaction: {
            chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
            header: {
                expiration: '2018-07-14T10:43:28',
                refBlockNum: 6439,
                refBlockPrefix: 2995713264,
                maxNetUsageWords: 0,
                maxCpuUsageMs: 0,
                delaySec: 0,
            },
            actions: [
                {
                    ...common,
                    name: 'transfer',
                    data: {
                        from: 'miniminimini',
                        to: 'maximaximaxi',
                        quantity: '1.0000 EOS',
                        memo: 'testtest',
                    },
                },
                {
                    ...common,
                    name: 'delegatebw',
                    data: {
                        from: 'miniminimini',
                        receiver: 'maximaximaxi',
                        stake_net_quantity: '1.0000 EOS',
                        stake_cpu_quantity: '1.0000 EOS',
                        transfer: true,
                    },
                },
                {
                    ...common,
                    name: 'undelegatebw',
                    data: {
                        from: 'miniminimini',
                        receiver: 'maximaximaxi',
                        unstake_net_quantity: '1.0000 EOS',
                        unstake_cpu_quantity: '1.0000 EOS',
                    },
                },
                {
                    ...common,
                    name: 'buyram',
                    data: {
                        payer: 'miniminimini',
                        receiver: 'miniminimini',
                        quant: '1000000000.0000 EOS',
                    },
                },
                {
                    ...common,
                    name: 'buyrambytes',
                    data: {
                        payer: 'miniminimini',
                        receiver: 'miniminimini',
                        bytes: 1023,
                    },
                },
                {
                    ...common,
                    name: 'sellram',
                    data: {
                        account: 'miniminimini',
                        bytes: 1024,
                    },
                },
                {
                    ...common,
                    name: 'voteproducer',
                    data: {
                        voter: 'miniminimini',
                        proxy: '',
                        producers: ['argentinaeos'],
                    },
                },
                {
                    ...common,
                    name: 'refund',
                    data: {
                        owner: 'miniminimini',
                    },
                },
                {
                    ...common,
                    name: 'updateauth',
                    data: {
                        account: 'miniminimini',
                        permission: 'active',
                        parent: 'owner',
                        auth: {
                            threshold: 1,
                            keys: [
                                {
                                    weight: 1,
                                    key: 'EOS8Dkj827FpinZBGmhTM28B85H9eXiFH5XzvLoeukCJV5sKfLc6K',
                                },
                                {
                                    weight: 2,
                                    key: 'EOS8Dkj827FpinZBGmhTM28B85H9eXiFH5XzvLoeukCJV5sKfLc6K',
                                },
                            ],
                            accounts: [{
                                permission: {
                                    actor: 'miniminimini',
                                    permission: 'active',
                                },
                                weight: 3,
                            }],
                            waits: [
                                {
                                    wait_sec: 55,
                                    weight: 4,
                                },
                            ],
                        },
                    },
                },
                {
                    ...common,
                    name: 'deleteauth',
                    data: {
                        account: 'maximaximaxi',
                        permission: 'active',
                    },
                },
                {
                    ...common,
                    name: 'linkauth',
                    data: {
                        account: 'maximaximaxi',
                        code: 'eosbet',
                        type: 'whatever',
                        requirement: 'active',
                    },
                },
                {
                    ...common,
                    name: 'unlinkauth',
                    data: {
                        account: 'miniminimini',
                        code: 'eosbet',
                        type: 'whatever',
                    },
                },
                {
                    ...common,
                    name: 'newaccount',
                    data: {
                        creator: 'miniminimini',
                        name: 'maximaximaxi',
                        owner: {
                            threshold: 1,
                            keys: [
                                {
                                    key: 'EOS8Dkj827FpinZBGmhTM28B85H9eXiFH5XzvLoeukCJV5sKfLc6K',
                                    weight: 1,
                                },
                            ],
                            accounts: [],
                            waits: [],
                        },
                        active: {
                            threshold: 1,
                            keys: [
                                {
                                    key: 'EOS8Dkj827FpinZBGmhTM28B85H9eXiFH5XzvLoeukCJV5sKfLc6K',
                                    weight: 1,
                                },
                            ],
                            accounts: [],
                            waits: [],
                        },
                    },
                },
                {
                    ...common,
                    name: 'setcode',
                    data: '0000',
                },
                {
                    ...common,
                    name: 'setabi',
                    data: '0000',
                },
                {
                    ...common,
                    name: 'bar-action',
                    data: '0000',
                },
            ],
        },
    });

    if (sign.success) {
        const { payload } = sign;
        (payload.signature: string);
    }
};
