/* @flow */
// TrezorConnect API types tests

// Exports:
/* eslint-disable no-unused-vars */
import TrezorConnect, {
    UI_EVENT,
    DEVICE_EVENT,
    RESPONSE_EVENT,
    TRANSPORT_EVENT,
    BLOCKCHAIN_EVENT,
    BLOCKCHAIN,
    DEVICE,
    ERRORS,
    IFRAME,
    POPUP,
    TRANSPORT,
    UI,
} from '../index';
/* eslint-disable no-unused-vars */

// Types exports:
import type {
    Device,
    DeviceStatus,
    FirmwareRelease,
    DeviceFirmwareStatus,
    DeviceMode,
    Features,
} from './index';

export const init = async () => {
    const manifest = { appUrl: '', email: '' };
    TrezorConnect.init({ manifest });
    // $FlowIssue: invalid params
    TrezorConnect.init();
    // $FlowIssue: invalid params
    TrezorConnect.init({});
    // $FlowIssue: invalid params
    TrezorConnect.init({ manifest: { appUrl: '', email: '' }, connectSrc: undefined });

    TrezorConnect.manifest(manifest);
    // $FlowIssue: invalid params
    TrezorConnect.manifest({});
    // $FlowIssue: invalid params
    TrezorConnect.manifest({ appUrl: 1 });
    // $FlowIssue: invalid params
    TrezorConnect.manifest({ email: 1 });
};

export const getAddress = async () => {
    // regular
    const single = await TrezorConnect.getAddress({ path: 'a' });
    if (single.success) {
        const { payload } = single;
        (payload.address: string);
        (payload.path: number[]);
        (payload.serializedPath: string);
        // $FlowIssue
        payload.forEach(item => {
            (item.address: string);
        });
    }

    // bundle
    const bundle = await TrezorConnect.getAddress({ bundle: [{ path: 'a' }] });
    if (bundle.success) {
        bundle.payload.forEach(item => {
            (item.address: string);
            (item.path: number[]);
            (item.serializedPath: string);
        });
        // $FlowIssue
        (bundle.payload.address: string);
    } else {
        (bundle.payload.error: string);
    }
};

export const events = async () => {
    TrezorConnect.on(DEVICE_EVENT, event => {
        event.type === 'device-connect';
        (event.payload.path: string);
    });

    TrezorConnect.on(TRANSPORT_EVENT, event => {
        if (event.type === TRANSPORT.START) {
            (event.payload.type: string);
            (event.payload.version: string);
            (event.payload.outdated: boolean);
        }
    });
};

export const compose = async () => {
    const simple = await TrezorConnect.composeTransaction({
        outputs: [],
        coin: 'btc',
    });
    if (simple.success) {
        (simple.payload.serializedTx: string);
    }

    const precompose = await TrezorConnect.composeTransaction({
        outputs: [],
        account: {
            path: 'm/49',
            addresses: {
                used: [],
                unused: [],
                change: [],
            },
            utxo: [],
        },
        feeLevels: [{ feePerUnit: '1' }],
        coin: 'btc',
    });
    if (precompose.success) {
        const tx = precompose.payload;
        if (tx.type === 'error') {
            (tx.error: string);
        }
        if (tx.type === 'nonfinal') {
            // $FlowIssue: transaction not final yet
            (tx.transaction: any);
        }
        if (tx.type === 'final') {
            (tx.transaction.inputs: any[]);
            (tx.transaction.outputs: any[]);
        }
    }
};

/* eslint-disable no-redeclare */
declare function F_Foo({ key: '1' }): Promise<{ success: boolean; payload: string }>;
declare function F_Foo({ key2: '2' }): Promise<{ success: boolean; payload: boolean }>;
/* eslint-enable no-redeclare */

interface MultiFoo {
    ({ key: string }): Promise<{ success: boolean; payload: string }>;
    ({ key2: string }): Promise<{ success: boolean; payload: boolean }>;
}

type ApiTest = {
    method: ({ key: '5' }) => Promise<{ success: number }>;
    requestLogin: MultiFoo;
    // requestLogin: typeof F_Foo;
    // requestLogin: (({ key: "1" }) => Promise<{
    //     payload: string;
    //     success: boolean;
    //   }>) &
    //     (({ key2: "2" }) => Promise<{
    //       payload: boolean;
    //       success: boolean;
    //     }>);

    // requestLogin: ({ key: '1' }) => Promise<{ success: boolean; payload: string }>
    //     | ({ key2: '2' }) => Promise<{ success: boolean; payload: boolean }>;
}

type ApiMethod<M> = $ElementType<ApiTest, M>;
type ExtractReturn<Fn> = $Call<<T1>((...Iterable<any>) => T1) => T1, ApiMethod<Fn>>;
// type ExtractArg = <Arg, Ret>([Arg => Ret]) => Arg;
type ExtractArg = <Arg>([Arg => any]) => Arg;
type ExtractArgs = <A>((A) => any) => [A];
type TransformArgsM<Method> = <Arg>((Arg) => any) => [Arg & { m: Method }];
type TransformArgs<Method> = <Arg>((Arg) => any) => [Arg];
type TransformArgsShape<Method> = <Arg>((Arg) => any) => [$Shape<Arg>];
type CallArgs<Method> = $Call<TransformArgs<Method>, $ElementType<ApiTest, Method>>;
type CallArg<Method> = $Call<ExtractArgs, $ElementType<ApiTest, Method>>;
type CallFn<Method> = (...args: CallArgs<Method>) => Promise<any>;

// declare function arguments<A>((A) => any): [A & { method: '1' }];
// type $Arguments<F> = $Call<typeof arguments, F>;

// const f = (f: { p: string }) => {};
// const a: $Arguments<typeof f> = [{ method: '1', p: '1' }];

// type CommonCall<Method> = $Call<ExtractArg, $ElementType<typeof TrezorConnect, Method>>;
// type CallFn<Method> = (...args: CommonCall<Method>) => Promise<any>;

// const FN2: $PropertyType<ApiTest, 'requestLogin'> = async (props) => {
const FN2: $PropertyType<ApiTest, 'requestLogin'> = async (props) => {
    if (props.key) {
        // (props.key: '1');
        return {
            success: true,
            payload: 'string',
        };
    }
    (props.key2: '2');
    return {
        success: true,
        payload: true,
    };
};
// let ca1: CallArgs<'requestLogin'>;
// (ca1: [{ m: 'requestLogin'; key: '1' }]);
// (ca1: [{ m: 'requestLogin'; key2: '2' }]);
// const ca: CallArg<'requestLogin'> = [{ key: '1' }];
// ({ key: '1' }: CallArg<'requestLogin'>);
// ({ key2: '2' }: CallArg<'requestLogin'>);

let apiTestObj: ApiTest;
const a = async () => {
    const aa = await apiTestObj.requestLogin({ key: '1' });
    (aa: { success: boolean; payload: string });
    const bb = await apiTestObj.requestLogin({ key2: '2' });
    (bb: { success: boolean; payload: boolean });
};

const FN: CallFn<'requestLogin'> = async (props) => {
    // (props.m: 'requestLogin');
    if (props.key2) {
        (props.key2: '2');
        // (props.key: '1');
    }
    if (props.key) {
        (props.key: '1');
    }

    // (props.key2: '1');
};

const ApiImplement: ApiTest = {
    method: async () => {
        return { success: 1 };
    },
    requestLogin: params => FN(params),
};

// const k1 = { key: '1' };
// const k2 = { key2: '1' };
// FN({ ...k2 });
// FN({ m: 'requestLogin', key: '1' });

// let a
// ;((a = [1]): Arguments<Fn1>) // error
// ;((a = [undefined]): Arguments<Fn1>)
// ;((a = ['x']): Arguments<Fn1>)
// ;((a = ['a', 1]): Arguments<Fn2>)

