/* @flow */
'use strict';

import { httpRequest } from '../utils/networkUtils';
import { DEFAULT_PRIORITY } from '../data/ConnectSettings';
import { parseCoinsJson, parseEthereumNetworksJson } from './CoinInfo';
import { parseFirmware } from './FirmwareInfo';
import { Promise } from 'es6-promise';
import { getOrigin } from '../utils/networkUtils';
import parseUri from 'parse-uri';

import type { ConnectSettings } from '../data/ConnectSettings';

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
type Resources = {
    bridge: string;
}
type Asset = {
    name: string;
    type?: string;
    url: string;
}
type Config = {
    +whitelist: Array<WhiteList>;
    +webusb: Array<WebUSB>;
    +resources: Resources;
    +assets: Array<Asset>;
    +supportedBrowsers: { [key: string]: Browser };
}

type AssetCollection = { [key: string] : JSON };

// TODO: transform json to flow typed object
const parseConfig = (json: any): Config => {
    const config: Config = json;
    return config;
}

export default class DataManager {
    static config: Config;
    static assets: AssetCollection = {};
    static settings: ConnectSettings;
    static cachePassphrase: boolean = false;

    static async load(settings: ConnectSettings): Promise<void> {
        const ts: number = new Date().getTime();
        const configUrl: string = `${settings.configSrc}?r=${ ts }`;

        try {
            this.settings = settings;
            const config: JSON = await httpRequest(configUrl, 'json');
            this.config = parseConfig(config);

            // check if origin is trusted
            const whitelist: ?WhiteList = DataManager.isWhitelisted(this.settings.origin || "");
            this.settings.trustedHost = !!whitelist && !this.settings.popup;
            if (this.settings.debug && !this.settings.trustedHost && !whitelist) {
                this.settings.debug = false;
            }
            this.settings.priority = DataManager.getPriority(whitelist);

            for (const asset of this.config.assets) {
                const json: JSON = await httpRequest(`${asset.url}?r=${ ts }`, asset.type || 'json');
                this.assets[ asset.name ] = json;
            }

            // parse coins definitions
            parseCoinsJson( this.assets['coins'] );
            parseEthereumNetworksJson(this.assets['ethereumNetworks']);

            // parse firmware definitions
            parseFirmware( this.assets['firmware-t1'] );
            parseFirmware( this.assets['firmware-t2'] );
        } catch (error) {
            throw error;
        }
    }

    static getMessages(): JSON {
        return this.assets['messages'];
    }

    static isWhitelisted(origin: string): ?WhiteList {
        if (!this.config) return null;
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
