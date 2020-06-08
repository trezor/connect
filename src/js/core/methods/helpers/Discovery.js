/* @flow */
import EventEmitter from 'events';
import { ERRORS } from '../../../constants';
import Blockchain from '../../../backend/BlockchainLink';
import DeviceCommands from '../../../device/DeviceCommands';
import { getAccountAddressN } from '../../../utils/accountUtils';
import { formatAmount } from '../../../utils/formatUtils';

import type { CoinInfo } from '../../../types';
import type { DiscoveryAccountType, DiscoveryAccount, GetAccountInfo } from '../../../types/account';

type DiscoveryType = {
    type: DiscoveryAccountType;
    getPath: (index: number) => number[];
}

type DiscoveryOptions = {
    blockchain: Blockchain;
    commands: DeviceCommands;
    limit?: number;
}

export default class Discovery extends EventEmitter {
    types: DiscoveryType[] = [];
    typeIndex: number;
    accounts: DiscoveryAccount[];
    coinInfo: CoinInfo;
    blockchain: Blockchain;
    commands: DeviceCommands;
    index: number;
    interrupted: boolean;
    completed: boolean;

    constructor(options: DiscoveryOptions) {
        super();

        this.accounts = [];
        this.index = 0;
        this.typeIndex = 0;
        this.interrupted = false;
        this.completed = false;
        this.blockchain = options.blockchain;
        this.commands = options.commands;
        this.coinInfo = options.blockchain.coinInfo;
        const { coinInfo } = this;

        // set discovery types
        if (coinInfo.type === 'bitcoin') {
            // Bitcoin-like coins could have multiple discovery types (bech32, segwit, legacy)
            // path utility wrapper. bip44 purpose can be set as well
            const getDescriptor = (purpose: number, index: number) => {
                return getAccountAddressN(coinInfo, index, { purpose });
            };
            // add bech32 discovery type
            if (coinInfo.xPubMagicSegwitNative) {
                this.types.push({
                    type: 'normal',
                    getPath: getDescriptor.bind(this, 84),
                });
            }
            // add segwit discovery type (normal if bech32 is not supported)
            if (coinInfo.xPubMagicSegwit) {
                this.types.push({
                    type: this.types.length > 0 ? 'segwit' : 'normal',
                    getPath: getDescriptor.bind(this, 49),
                });
            }
            // add legacy discovery type (normal if bech32 and segwit are not supported)
            this.types.push({
                type: this.types.length > 0 ? 'legacy' : 'normal',
                getPath: getDescriptor.bind(this, 44),
            });
        } else {
            // other coins has only normal discovery type
            this.types.push({
                type: 'normal',
                getPath: getAccountAddressN.bind(this, coinInfo),
            });
        }
    }

    async start(details?: $ElementType<GetAccountInfo, 'details'>): Promise<void> {
        const limit = 10; // TODO: move to options
        this.interrupted = false;
        while (!this.completed && !this.interrupted) {
            const accountType = this.types[this.typeIndex];
            const label = `Account #${(this.index + 1)}`;
            const overTheLimit = this.index >= limit;

            // get descriptor from device
            const path = accountType.getPath(this.index);
            const descriptor = await this.commands.getAccountDescriptor(this.coinInfo, path);

            if (!descriptor) {
                throw ERRORS.TypedError('Runtime', 'Discovery: descriptor not found');
            }
            if (this.interrupted) return;

            const account: DiscoveryAccount = {
                ...descriptor,
                type: accountType.type,
                label,
            };

            // remove duplicates (restore uncompleted discovery)
            this.accounts = this.accounts.filter(a => a.descriptor !== account.descriptor);

            // if index is below visible limit
            // add incomplete account info (without balance) and emit "progress"
            // this should render "Loading..." status
            if (!overTheLimit) {
                this.accounts.push(account);
                this.emit('progress', this.accounts);
            }

            // get account info from backend
            const info = await this.blockchain.getAccountInfo({ descriptor: account.descriptor, details });
            if (this.interrupted) return;

            // remove previously added incomplete account info
            this.accounts = this.accounts.filter(a => a.descriptor !== account.descriptor);

            // check if account should be displayed
            // eg: empty account with index 11 should not be rendered
            if (!overTheLimit || (overTheLimit && !info.empty)) {
                const balance = formatAmount(info.availableBalance, this.coinInfo);
                this.accounts.push({
                    ...account,
                    empty: info.empty,
                    balance,
                    addresses: info.addresses,
                });
                this.emit('progress', this.accounts);
            }

            // last account was empty. switch to next discovery type or complete the discovery process
            if (info.empty) {
                if (this.typeIndex + 1 < this.types.length) {
                    this.typeIndex++;
                    this.index = 0;
                } else {
                    this.emit('complete');
                    this.completed = true;
                }
            } else {
                this.index++;
            }
        }
    }

    stop() {
        this.interrupted = !this.completed;
    }

    dispose() {
        this.accounts = [];
    }
}

