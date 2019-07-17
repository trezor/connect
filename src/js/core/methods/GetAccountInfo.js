/* @flow */

import AbstractMethod from './AbstractMethod';
import Discovery from './helpers/Discovery';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath, getSerializedPath } from '../../utils/pathUtils';
import { resolveAfter } from '../../utils/promiseUtils';
import { getCoinInfo } from '../../data/CoinInfo';
import { NO_COIN_INFO } from '../../constants/errors';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import { initBlockchain } from '../../backend/BlockchainLink';

import type { CoreMessage, CoinInfo } from '../../types';
import type { $GetAccountInfo } from '../../types/params';
import type { AccountInfo } from '../../types/account';

type Request = $GetAccountInfo & { address_n: number[], coinInfo: CoinInfo };
type Params = Array<Request>;

export default class GetAccountInfo extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;
    discovery: Discovery | typeof undefined = undefined;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read'];
        // this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Ripple'), this.firmwareRange);
        this.info = 'Export account info';
        this.useDevice = true;
        this.useUi = true;

        let willUseDevice = false;
        // create a bundle with only one batch if bundle doesn't exists
        const payload: Object = !message.payload.hasOwnProperty('bundle') ? { ...message.payload, bundle: [ ...message.payload ] } : message.payload;

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
        ]);

        payload.bundle.forEach(batch => {
            // validate incoming parameters
            validateParams(batch, [
                { name: 'coin', type: 'string', obligatory: true },
                { name: 'descriptor', type: 'string' },
                { name: 'path', type: 'string' },

                { name: 'details', type: 'string' },
                { name: 'tokens', type: 'string' },
                { name: 'page', type: 'number' },
                { name: 'pageSize', type: 'number' },
                { name: 'from', type: 'number' },
                { name: 'to', type: 'number' },
                { name: 'contractFilter', type: 'string' },
                { name: 'gap', type: 'number' },
                { name: 'marker', type: 'object' },
            ]);

            // validate coin info
            const coinInfo: ?CoinInfo = getCoinInfo(batch.coin);
            if (!coinInfo) {
                throw NO_COIN_INFO;
            }
            if (!coinInfo.blockchainLink) {
                throw new Error('BlockchainLink support not found for ' + coinInfo.name);
            }
            // validate path if exists
            if (batch.path) {
                batch.address_n = validatePath(batch.path, 3);
                willUseDevice = typeof batch.descriptor !== 'string';
            }
            if (!batch.path && !batch.descriptor) {
                if (payload.bundle.length > 1) {
                    throw Error('Discovery for multiple coins in not supported');
                }
                willUseDevice = true;
            }
            batch.coinInfo = coinInfo;

            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
        });

        // set info
        // if (payload.bundle.length === 1) {
        //     this.info = getNetworkLabel('Export #NETWORK account', payload.bundle[0].network);
        // } else {
        //     const requestedNetworks: Array<?EthereumNetworkInfo> = payload.bundle.map(b => b.network);
        //     const uniqNetworks = uniq(requestedNetworks);
        //     if (uniqNetworks.length === 1 && uniqNetworks[0]) {
        //         this.info = getNetworkLabel('Export multiple #NETWORK accounts', uniqNetworks[0]);
        //     } else {
        //         this.info = 'Export multiple accounts';
        //     }
        // }

        this.useDevice = willUseDevice;
        this.useUi = willUseDevice;

        this.params = payload.bundle;
    }

    async confirmation(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        const label: string = this.info;
        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-address',
            label,
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async noBackupConfirmation(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'no-backup',
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async run(): Promise<AccountInfo | AccountInfo[]> {
        // address_n and descriptor are not set. use discovery
        if (this.params.length === 1 && !this.params[0].address_n && !this.params[0].descriptor) {
            return this.discover(this.params[0]);
        }

        const responses: AccountInfo[] = [];
        const bundledResponse = this.params.length > 1;

        for (let i = 0; i < this.params.length; i++) {
            const request = this.params[i];
            const { address_n } = request;
            let descriptor = request.descriptor;

            // get descriptor from device
            if (address_n && typeof descriptor !== 'string') {
                const accountDescriptor = await this.device.getCommands().getAccountDescriptor(
                    request.coinInfo,
                    address_n,
                );
                if (!accountDescriptor) throw new Error('no descriptor');
                descriptor = accountDescriptor.descriptor;
            }

            if (typeof descriptor !== 'string') {
                // this shouldn't happened
                throw new Error('no descriptor');
            }

            // initialize backend
            const blockchain = await initBlockchain(request.coinInfo);

            // get account info from backend
            const info = await blockchain.getAccountInfo({
                descriptor,
                details: request.details,
                tokens: request.tokens,
                page: request.page,
                pageSize: request.pageSize,
                from: request.from,
                to: request.to,
                contractFilter: request.contractFilter,
                gap: request.gap,
                marker: request.marker,
            });

            let utxo: $ElementType<AccountInfo, 'utxo'>;
            if (request.coinInfo.type === 'bitcoin' && typeof request.details === 'string' && request.details !== 'basic') {
                utxo = await blockchain.getAccountUtxo(descriptor);
            }

            // add account to responses
            responses.push({
                path: request.path,
                ...info,
                descriptor, // override descriptor (otherwise eth checksum is lost)
                utxo,
            });

            // send progress to UI
            if (bundledResponse) {
                this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response: info,
                }));
            }
        }
        return bundledResponse ? responses : responses[0];
    }

    async discover(request: Request) {
        const { coinInfo } = request;
        const blockchain = await initBlockchain(coinInfo);
        const dfd = this.createUiPromise(UI.RECEIVE_ACCOUNT, this.device);

        const discovery = new Discovery({
            blockchain,
            commands: this.device.getCommands(),
        });
        discovery.on('progress', (accounts: Array<any>) => {
            this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                type: 'progress',
                coinInfo,
                accounts,
            }));
        });
        discovery.on('complete', () => {
            this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                type: 'end',
                coinInfo,
            }));
        });
        // catch error from discovery process
        discovery.start().catch(error => {
            dfd.reject(error);
        });

        // set select account view
        // this view will be updated from discovery events
        this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            type: 'start',
            accountTypes: discovery.types.map(t => t.type),
            coinInfo,
        }));

        // wait for user action
        const uiResp = await dfd.promise;
        discovery.stop();

        const resp: number = uiResp.payload;
        const account = discovery.accounts[resp];

        if (!discovery.completed) {
            await resolveAfter(501); // temporary solution, TODO: immediately resolve will cause "device call in progress"
        }

        // get account info from backend
        const info = await blockchain.getAccountInfo({
            descriptor: account.descriptor,
            details: request.details,
            tokens: request.tokens,
            page: request.page,
            pageSize: request.pageSize,
            from: request.from,
            to: request.to,
            contractFilter: request.contractFilter,
            gap: request.gap,
            marker: request.marker,
        });

        let utxo: $ElementType<AccountInfo, 'utxo'>;
        if (request.coinInfo.type === 'bitcoin' && typeof request.details === 'string' && request.details !== 'basic') {
            utxo = await blockchain.getAccountUtxo(account.descriptor);
        }

        return {
            path: getSerializedPath(account.address_n),
            ...info,
            utxo,
        };
    }

    dispose() {
        const { discovery } = this;
        if (discovery) {
            discovery.removeAllListeners();
            discovery.stop();
        }
    }
}
