/* @flow */
import AbstractMethod from './AbstractMethod';
import Discovery from './helpers/Discovery';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath, getSerializedPath } from '../../utils/pathUtils';
import { getAccountLabel } from '../../utils/accountUtils';
import { resolveAfter } from '../../utils/promiseUtils';
import { getCoinInfo } from '../../data/CoinInfo';

import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';

import { isBackendSupported, initBlockchain } from '../../backend/BlockchainLink';

import type { CoreMessage, CoinInfo } from '../../types';
import type { GetAccountInfo as GetAccountInfoParams, AccountInfo, AccountUtxo } from '../../types/account';
import type { FirmwareException } from '../../types/events';

type Request = GetAccountInfoParams & { address_n: number[]; coinInfo: CoinInfo };
type Params = Request[];

export default class GetAccountInfo extends AbstractMethod {
    params: Params;
    disposed: boolean = false;
    hasBundle: boolean;
    discovery: Discovery | typeof undefined = undefined;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read'];
        this.info = 'Export account info';
        this.useDevice = true;
        this.useUi = true;

        // assume that device will not be used
        let willUseDevice = false;

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = Object.prototype.hasOwnProperty.call(message.payload, 'bundle');
        const payload: Object = !this.hasBundle ? { ...message.payload, bundle: [ message.payload ] } : message.payload;

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
                { name: 'defaultAccountType', type: 'string' },
            ]);

            // validate coin info
            const coinInfo: ?CoinInfo = getCoinInfo(batch.coin);
            if (!coinInfo) {
                throw ERRORS.TypedError('Method_UnknownCoin');
            }
            // validate backend
            isBackendSupported(coinInfo);
            // validate path if exists
            if (batch.path) {
                batch.address_n = validatePath(batch.path, 3);
                // since there is no descriptor device will be used
                willUseDevice = typeof batch.descriptor !== 'string';
            }
            if (!batch.path && !batch.descriptor) {
                if (payload.bundle.length > 1) {
                    throw Error('Discovery for multiple coins in not supported');
                }
                // device will be used in Discovery
                willUseDevice = true;
            }
            batch.coinInfo = coinInfo;

            // set firmware range
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
        });

        this.params = payload.bundle;

        this.useDevice = willUseDevice;
        this.useUi = willUseDevice;
    }

    async confirmation(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        if (this.params.length === 1 && !this.params[0].path && !this.params[0].descriptor) {
            // request confirmation view
            this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'export-account-info',
                label: `Export info for ${ this.params[0].coinInfo.label } account of your selection`,
                customConfirmButton: {
                    label: 'Proceed to account selection',
                    className: 'not-empty-css',
                },
            }));
        } else {
            const keys: { [coin: string]: { coinInfo: CoinInfo; values: Array<string | number[]>} } = {};
            this.params.forEach(b => {
                if (!keys[b.coinInfo.label]) {
                    keys[b.coinInfo.label] = {
                        coinInfo: b.coinInfo,
                        values: [],
                    };
                }
                keys[b.coinInfo.label].values.push(b.descriptor || b.address_n);
            });

            // prepare html for popup
            const str: string[] = [];
            Object.keys(keys).forEach((k, i, a) => {
                const details = keys[k];
                details.values.forEach((acc, i) => {
                    // if (i === 0) str += this.params.length > 1 ? ': ' : ' ';
                    // if (i > 0) str += ', ';
                    str.push('<span>');
                    str.push(k);
                    str.push(' ');
                    if (typeof acc === 'string') {
                        str.push(acc);
                    } else {
                        str.push(getAccountLabel(acc, details.coinInfo));
                    }
                    str.push('</span>');
                });
            });

            this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'export-account-info',
                label: `Export info for: ${str.join('')}`,
            }));
        }

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
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'no-backup',
        }));

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    // override AbstractMethod function
    // this is a special case where we want to check firmwareRange in bundle
    // and return error with bundle indexes
    async checkFirmwareRange(isUsingPopup: boolean): Promise<?$PropertyType<FirmwareException, 'type'>> {
        // for popup mode use it like it was before
        if (isUsingPopup || this.params.length === 1) {
            return super.checkFirmwareRange(isUsingPopup);
        }
        // for trusted mode check each batch and return error with invalid bundle indexes
        const defaultRange = {
            '1': { min: '1.0.0', max: '0' },
            '2': { min: '2.0.0', max: '0' },
        };
        // find invalid ranges
        const invalid = [];
        for (let i = 0; i < this.params.length; i++) {
            // set FW range for current batch
            this.firmwareRange = getFirmwareRange(this.name, this.params[i].coinInfo, defaultRange);
            const exception = await super.checkFirmwareRange(false);
            if (exception) {
                invalid.push({
                    index: i,
                    exception,
                    coin: this.params[i].coin,
                });
            }
        }
        // return invalid ranges in custom error
        if (invalid.length > 0) {
            throw ERRORS.TypedError('Method_Discovery_BundleException', JSON.stringify(invalid));
        }
        return null;
    }

    async run(): Promise<AccountInfo | Array<AccountInfo | null> | null> {
        // address_n and descriptor are not set. use discovery
        if (this.params.length === 1 && !this.params[0].address_n && !this.params[0].descriptor) {
            return this.discover(this.params[0]);
        }

        const responses: Array<AccountInfo | null> = [];

        const sendProgress = (progress: number, response: AccountInfo | null, error?: string) => {
            if (!this.hasBundle || (this.device && this.device.getCommands().disposed)) return;
            // send progress to UI
            this.postMessage(UiMessage(UI.BUNDLE_PROGRESS, {
                progress,
                response,
                error,
            }));
        };

        for (let i = 0; i < this.params.length; i++) {
            const request = this.params[i];
            const { address_n } = request;
            let descriptor = request.descriptor;
            let legacyXpub: ?string;

            if (this.disposed) break;

            // get descriptor from device
            if (address_n && typeof descriptor !== 'string') {
                try {
                    const accountDescriptor = await this.device.getCommands().getAccountDescriptor(
                        request.coinInfo,
                        address_n,
                    );
                    if (accountDescriptor) {
                        descriptor = accountDescriptor.descriptor;
                        legacyXpub = accountDescriptor.legacyXpub;
                    }
                } catch (error) {
                    if (this.hasBundle) {
                        responses.push(null);
                        sendProgress(i, null, error.message);
                        continue;
                    } else {
                        throw error;
                    }
                }
            }

            if (this.disposed) break;

            try {
                if (typeof descriptor !== 'string') {
                    throw ERRORS.TypedError('Runtime', 'GetAccountInfo: descriptor not found');
                }

                // initialize backend
                const blockchain = await initBlockchain(request.coinInfo, this.postMessage);

                if (this.disposed) break;

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

                if (this.disposed) break;

                let utxo: AccountUtxo;
                if (request.coinInfo.type === 'bitcoin' && typeof request.details === 'string' && request.details !== 'basic') {
                    utxo = await blockchain.getAccountUtxo(descriptor);
                }

                if (this.disposed) break;

                // add account to responses
                const account: AccountInfo = {
                    path: request.path,
                    ...info,
                    descriptor, // override descriptor (otherwise eth checksum is lost)
                    legacyXpub,
                    utxo,
                };
                responses.push(account);

                sendProgress(i, account);
            } catch (error) {
                if (this.hasBundle) {
                    responses.push(null);
                    sendProgress(i, null, error.message);
                    continue;
                } else {
                    throw error;
                }
            }
        }
        if (this.disposed) return new Promise(() => {});
        return this.hasBundle ? responses : responses[0];
    }

    async discover(request: Request) {
        const { coinInfo, defaultAccountType } = request;
        const blockchain = await initBlockchain(coinInfo, this.postMessage);
        const dfd = this.createUiPromise(UI.RECEIVE_ACCOUNT, this.device);

        const discovery = new Discovery({
            blockchain,
            commands: this.device.getCommands(),
        });
        discovery.on('progress', (accounts: Array<any>) => {
            this.postMessage(UiMessage(UI.SELECT_ACCOUNT, {
                type: 'progress',
                coinInfo,
                accounts,
            }));
        });
        discovery.on('complete', () => {
            this.postMessage(UiMessage(UI.SELECT_ACCOUNT, {
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
        this.postMessage(UiMessage(UI.SELECT_ACCOUNT, {
            type: 'start',
            accountTypes: discovery.types.map(t => t.type),
            defaultAccountType,
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

        let utxo: AccountUtxo;
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
        this.disposed = true;
        const { discovery } = this;
        if (discovery) {
            discovery.removeAllListeners();
            discovery.stop();
        }
    }
}
