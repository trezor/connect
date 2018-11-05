/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

// get public key

export type EosPublicKey = {
  wifPublicKey: string,
  rawPublicKey: string,
  path: Array<number>,
  serializedPath: string,
}

export type $EosGetPublicKey = {
  path: $Path,
  showOnTrezor?: boolean,
}

export type EosGetPublicKey$ = {
  success: true,
  payload: EosPublicKey,
} | Unsuccessful$;

export type EosGetPublicKey$$ = {
  success: true,
  payload: Array<EosPublicKey>,
} | Unsuccessful$;

// get sign tx

export type EosTxHeader = {
  expiration: number,
  refBlockNum: number,
  refBlockPrefix: number,
  maxNetUsageWords: number,
  maxCpuUsageMs: number,
  delaySec: number,
}

export type EosAsset = {
  amount: number,
  symbol: number,
}

export type EosPermissionLevel = {
  actor: number,
  permission: number,
}

export type EosAuthorizationKey = {
  type: number,
  key: string,
  weight: number,
}

export type EosAuthorizationAccount = {
  account: EosPermissionLevel,
  weight: number,
}

export type EosAuthorizationWait = {
  wait_sec: number,
  weight: number,
}

export type EosAuthorization = {
  threshold: number,
  keys: Array<EosAuthorizationKey>,
  accounts: Array<EosAuthorizationAccount>,
  waits: Array<EosAuthorizationWait>,
}

export type EosActionCommon = {
  account: number,
  name: number,
  authorization: Array<EosPermissionLevel>,
}

export type EosActionTransfer = {
  sender: number,
  receiver: number,
  quantity: EosAsset,
  memo: string,
}

export type EosActionDelegate = {
  sender: number,
  receiver: number,
  netQuantity: EosAsset,
  cpuQuantity: EosAsset,
  transfer: boolean,
}

export type EosActionUndelegate = {
  sender: number,
  receiver: number,
  netQuantity: EosAsset,
  cpuQuantity: EosAsset,
}

export type EosActionBuyRam = {
  payer: number,
  receiver: number,
  quantity: EosAsset,
}

export type EosActionBuyRamBytes = {
  payer: number,
  receiver: number,
  bytes: number,
}

export type EosActionSellRam = {
  account: number,
  bytes: number,
}

export type EosActionVoteProducer = {
  voter: number,
  proxy?: number,
  producers: Array<number>,
}

export type EosActionRefund = {
  owner: number,
}

export type EosActionUpdateAuth = {
  account: number,
  permission: number,
  parent: number,
  auth: EosAuthorization,
}

export type EosActionDeleteAuth = {
  account: number,
  permission: number,
}

export type EosActionLinkAuth = {
  account: number,
  code: number,
  type: number,
  requirement: number,
}

export type EosActionUnlinkAuth = {
  account: number,
  code: number,
  type: number,
}

export type EosActionNewAccount = {
  creator: number,
  name: number,
  owner: EosAuthorization,
  active: EosAuthorization,
}

export type EosActionUnknown = {
  dataSize: number,
  data: string,
}

export type EosTxActionAck = {
  common: EosActionCommon,
  transfer: EosActionTransfer,
  delegate: EosActionDelegate,
  undelegate: EosActionUndelegate,
  buyRam: EosActionBuyRam,
  buyRamBytes: EosActionBuyRamBytes,
  sellRam: EosActionSellRam,
  voteProducer: EosActionVoteProducer,
  refund: EosActionRefund,
  updateAuth: EosActionUpdateAuth,
  deleteAuth: EosActionDeleteAuth,
  linkAuth: EosActionLinkAuth,
  unlinkAuth: EosActionUnlinkAuth,
  newAccount: EosActionNewAccount,
  unknown: EosActionUnknown,
}

export type Transaction = {
  chainId: string,
  header: ?EosTxHeader,
  actions: Array<EosTxActionAck>,
}

export type EosSignedTx = {
  signatureV: number,
  signatureR: string,
  signatureS: string,
}

export type $EosSignTx = $Common & {
  path: $Path,
  transaction: Transaction,
}

export type EosSignTx$ = {
  success: true,
  payload: EosSignedTx,
} | Unsuccessful$;
