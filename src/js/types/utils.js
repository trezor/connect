/* @flow */

import type { API } from './api';

// get type of API method
export type ApiElement<M> = $ElementType<API, M>;

// get return value of API method
export type ExtractReturn<Fn> = $Call<<T1>((...Iterable<any>) => T1) => T1, ApiElement<Fn>>;

// transform API method function to return Promise<any> (temporary workaround)
type ExtractArgs = <A>((A) => any) => [A];
// type TransformArgs<M> = <Arg>((Arg) => any) => [Arg & { method: M }];
type ApiArgs<M> = $Call<ExtractArgs, $ElementType<API, M>>;
// export type ApiMethod<M> = (...args: ApiArgs<M>) => Promise<any>;
export type ApiMethod<M> = (...args: $Call<ExtractArgs, M>) => Promise<any>;
