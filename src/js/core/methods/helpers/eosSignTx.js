/* @flow */
'use strict';

import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';
import type {
    Transaction as $EosTransaction,
    EosTxActionAck as $EosTxActionAck,
    // EosTxHeader as $EosTxHeader,
} from '../../../types/eos';

const splitString = (str: ?string, len: number): [string, string] => {
    if (str == null) {
        return ['', ''];
    }
    const first = str.slice(0, len);
    const second = str.slice(len);
    return [first, second];
};

import type {
    EosSignedTx,
    EosSignTx,
    EosTxActionAck,
    EosTxHeader,
    EosActionCommon,
    EosActionTransfer,
    EosActionDelegate,
    EosActionUndelegate,
    EosActionBuyRam,
    EosActionBuyRamBytes,
    EosActionSellRam,
    EosActionVoteProducer,
    EosActionRefund,
    EosActionUpdateAuth,
    EosActionDeleteAuth,
    EosActionLinkAuth,
    EosActionUnlinkAuth,
    EosActionNewAccount,
    EosActionUnknown,
} from '../../../types/trezor';

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    actions: Array<EosTxActionAck>,
    index: number,
): Promise<EosSignedTx> => {
    const lastOp: boolean = (index + 1 >= actions.length);

    const action = actions[index];

    if (action.unknown) {
        const [first, rest] = splitString(action.unknown.data_chunk, 1024 * 2);
        action.unknown.data_chunk = first;
        if (rest.length === 0) {
            if (lastOp) {
                const response: MessageResponse<EosSignedTx> = await typedCall('EosTxActionAck', 'EosSignedTx', action);
                return response.message;
            } else {
                await typedCall('EosTxActionAck', 'EosTxActionRequest', action);
            }
        } else {
            await typedCall('EosTxActionAck', 'EosTxActionRequest', action);
            action.unknown.data_chunk = rest;
            return await processTxRequest(
                typedCall,
                actions,
                index
            );
        }
    } else {
        if (lastOp) {
            const response: MessageResponse<EosSignedTx> = await typedCall('EosTxActionAck', 'EosSignedTx', action);
            return response.message;
        } else {
            await typedCall('EosTxActionAck', 'EosTxActionRequest', action);
        }
    }

    return await processTxRequest(
        typedCall,
        actions,
        index + 1
    );
};

export const eosSignTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    address_n: Array<number>,
    tx: $EosTransaction,
): Promise<EosSignedTx> => {
    // eslint-disable-next-line no-use-before-define
    const message: EosSignTx = prepareSignTx(tx);
    message.address_n = address_n;

    const actions: Array<EosTxActionAck> = [];
    tx.actions.forEach(action => {
        // eslint-disable-next-line no-use-before-define
        const prepared: ?EosTxActionAck = prepareTxActionAck(action);
        if (prepared) { actions.push(prepared); }
    });

    await typedCall('EosSignTx', 'EosTxActionRequest', message);

    return await processTxRequest(typedCall, actions, 0);
};

// transform incoming parameters to protobuf messages format
const prepareSignTx = (tx: $EosTransaction): EosSignTx => {
    const header: ?EosTxHeader = tx.header ? {
        expiration: tx.header.expiration,
        ref_block_num: tx.header.refBlockNum,
        ref_block_prefix: tx.header.refBlockPrefix,
        max_net_usage_words: tx.header.maxNetUsageWords,
        max_cpu_usage_ms: tx.header.maxCpuUsageMs,
        delay_sec: tx.header.delaySec,
    } : null;

    return {
        address_n: [], // will be overridden
        chain_id: tx.chainId,
        header: header,
        num_actions: tx.actions.length,
    };
};

const prepareTxActionAck = (action: $EosTxActionAck): EosTxActionAck => {
    const common: ?EosActionCommon = action.common ? {
        account: action.common.account,
        name: action.common.name,
        authorization: [{
            actor: action.common.authorization[0].actor,
            permission: action.common.authorization[0].permission,
        }],
    } : null;

    const transfer: ?EosActionTransfer = action.transfer ? {
        sender: action.transfer.sender,
        receiver: action.transfer.receiver,
        quantity: {
            amount: action.transfer.quantity.amount,
            symbol: action.transfer.quantity.symbol,
        },
        memo: action.transfer.memo,
    } : null;

    const delegate: ?EosActionDelegate = action.delegate ? {
        sender: action.delegate.sender,
        receiver: action.delegate.receiver,
        net_quantity: action.delegate.netQuantity,
        cpu_quantity: action.delegate.cpuQuantity,
        transfer: action.delegate.transfer,
    } : null;

    const undelegate: ?EosActionUndelegate = action.undelegate ? {
        sender: action.undelegate.sender,
        receiver: action.undelegate.receiver,
        net_quantity: action.undelegate.netQuantity,
        cpu_quantity: action.undelegate.cpuQuantity,
    } : null;

    const buy_ram: ?EosActionBuyRam = action.buyRam ? {
        payer: action.buyRam.payer,
        receiver: action.buyRam.receiver,
        quantity: action.buyRam.quantity,
    } : null;

    const buy_ram_bytes: ?EosActionBuyRamBytes = action.buyRamBytes ? {
        payer: action.buyRamBytes.payer,
        receiver: action.buyRamBytes.receiver,
        bytes: action.buyRamBytes.bytes,
    } : null;

    const sell_ram: ?EosActionSellRam = action.sellRam ? {
        account: action.sellRam.account,
        bytes: action.sellRam.bytes,
    } : null;

    const vote_producer: ?EosActionVoteProducer = action.voteProducer ? {
        voter: action.voteProducer.voter,
        proxy: action.voteProducer.proxy,
        producers: action.voteProducer.producers,
    } : null;

    const refund: ?EosActionRefund = action.refund ? {
        owner: action.refund.owner,
    } : null;

    const update_auth: ?EosActionUpdateAuth = action.updateAuth ? {
        account: action.updateAuth.account,
        permission: action.updateAuth.permission,
        parent: action.updateAuth.parent,
        auth: action.updateAuth.auth,
    } : null;

    const delete_auth: ?EosActionDeleteAuth = action.deleteAuth ? {
        account: action.deleteAuth.account,
        permission: action.deleteAuth.permission,
    } : null;

    const link_auth: ?EosActionLinkAuth = action.linkAuth ? {
        account: action.linkAuth.account,
        code: action.linkAuth.code,
        type: action.linkAuth.type,
        requirement: action.linkAuth.requirement,
    } : null;

    const unlink_auth: ?EosActionUnlinkAuth = action.unlinkAuth ? {
        account: action.unlinkAuth.account,
        code: action.unlinkAuth.code,
        type: action.unlinkAuth.type,
    } : null;

    const new_account: ?EosActionNewAccount = action.newAccount ? {
        creator: action.newAccount.creator,
        name: action.newAccount.name,
        owner: action.newAccount.owner,
        active: action.newAccount.active,
    } : null;

    const unknown: ?EosActionUnknown = action.unknown ? {
        data_size: action.unknown.dataSize,
        data_chunk: action.unknown.data,
    } : null;

    return {
        common,
        transfer,
        delegate,
        undelegate,
        buy_ram,
        buy_ram_bytes,
        sell_ram,
        vote_producer,
        refund,
        update_auth,
        delete_auth,
        link_auth,
        unlink_auth,
        new_account,
        unknown,
    };
};
