/* @flow */
'use strict';

import { httpRequest } from '../utils/networkUtils';
import { DEFAULT_PRIORITY } from '../entrypoints/ConnectSettings';
import { parseCoinsJson } from './CoinInfo';
import { Promise } from 'es6-promise';
import { getOrigin } from '../utils/networkUtils';
import parseUri from 'parse-uri';

import type { ConnectSettings } from '../entrypoints/ConnectSettings';

type WhiteList = {
    +priority: number;
    +origin: string;
}
type WebUSB = {
    +vendorId: string;
    +productId: string;
}
type Browser = {
    +version: number;
    +download: string;
    +update: string;
}
type Config = {
    +whitelist: Array<WhiteList>;
    +webusb: Array<WebUSB>;
    +supportedBrowsers: { [key: string]: Browser };
}

// TODO: transform json to flow typed object
const parseConfig = (json: any): Config => {
    const config: Config = json;
    return config;
}

export default class DataManager {
    static config: Config;
    static releases: JSON;
    static settings: ConnectSettings;
    static cachePassphrase: boolean = false;

    static async load(settings: ConnectSettings): Promise<void> {
        const ts: number = new Date().getTime();
        const configUrl: string = `${settings.configSrc}?r=${ ts }`;
        const coinsUrl: string = `${settings.coinsSrc}?r=${ ts }`;
        const releasesUrl: string = `${settings.firmwareReleasesSrc}?r=${ ts }`;

        try {
            const config: JSON = await httpRequest(configUrl, 'json');
            const coins: JSON = await httpRequest(coinsUrl, 'json');
            const releases: JSON = await httpRequest(releasesUrl, 'json');

            this.config = parseConfig(config);
            this.releases = releases;
            this.settings = settings;

            // check if origin is trusted
            const whitelist: ?WhiteList = DataManager.isWhitelisted(this.settings.origin || "");
            this.settings.trustedHost = !!whitelist && !this.settings.popup;
            if (this.settings.debug && !this.settings.trustedHost && !whitelist) {
                this.settings.debug = false;
            }
            this.settings.priority = DataManager.getPriority(whitelist);

            parseCoinsJson(coins);
        } catch (error) {
            // throw new Error('Cannot load config', error);
            throw error;
        }
    }

    static isWhitelisted(origin: string): ?WhiteList {
        const uri = parseUri(origin);
        if (uri && typeof uri.host === 'string') {
            const parts: Array<string> = uri.host.split('.');
            if (parts.length > 2) {
                // subdomain
                uri.host = parts.slice(parts.length - 2, parts.length).join('.');
            }
            return this.config.whitelist.find(item => (item.origin === origin || item.origin === uri.host));
        }
    }

    static getPriority(whitelist: ?WhiteList): number {
        if (whitelist) {
            return whitelist.priority;
        }
        return DEFAULT_PRIORITY;
    }

    static getRequiredFirmware(): string {
        return '1.5.1';
    }

    static getSettings(key: ?string): any {
        if (!this.settings) return null;
        if (typeof key === 'string') {
            return this.settings[key];
        }
        return this.settings;
    }

    static getDebugSettings(type: string): boolean {
        return false;
    }

    static getConfig(): Config {
        return this.config;
    }

    static isPassphraseCached(status: ?boolean): boolean {
        if (typeof status === 'boolean') {
            this.cachePassphrase = status;
        }
        return this.cachePassphrase; // this.json.device.cachePassphrase;
    }
}
