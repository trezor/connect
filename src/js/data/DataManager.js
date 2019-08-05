/* @flow */

import { httpRequest } from '../env/node/networkUtils';
import { parseBridgeJSON } from '../utils/browser';
import { DEFAULT_PRIORITY } from '../data/ConnectSettings';
import { parseCoinsJson } from './CoinInfo';
import { parseFirmware } from './FirmwareInfo';
import { Promise } from 'es6-promise';
import parseUri from 'parse-uri';
import * as bowser from 'bowser';
import semvercmp from 'semver-compare';

import type { ConnectSettings } from '../data/ConnectSettings';

type WhiteList = {
    +priority: number,
    +origin: string,
}
type KnownHost = {
    +origin: string,
    +label?: string,
    +icon?: string,
}
type WebUSB = {
    +vendorId: string,
    +productId: string,
}
type Browser = {
    +version: number,
    +download: string,
    +update: string,
}
type Resources = {
    bridge: string,
}
type Asset = {
    name: string,
    type?: string,
    url: string,
}
type ProtobufMessages = {
    name: string,
    range: {
        min: Array<string>,
        max?: Array<string>,
    },
    json: string,
}
export type Config = {
    +whitelist: Array<WhiteList>,
    +management: Array<WhiteList>,
    +knownHosts: Array<KnownHost>,
    +webusb: Array<WebUSB>,
    +resources: Resources,
    +assets: Array<Asset>,
    +messages: Array<ProtobufMessages>,
    +supportedBrowsers: { [key: string]: Browser },
    +supportedFirmware: Array<{|
        +coinType?: string,
        +coin?: string | string[],
        +excludedMethods?: Array<string>,
        +min?: Array<string>,
        +max?: Array<string>,
    |}>,
}

type AssetCollection = { [key: string]: JSON };

// TODO: transform json to flow typed object
const parseConfig = (json: any): Config => {
    const config: Config = json;
    return config;
};

export default class DataManager {
    static config: Config;
    static assets: AssetCollection = {};
    static settings: ConnectSettings;
    static messages: { [key: string]: JSON } = {};

    static async load(settings: ConnectSettings): Promise<void> {
        const ts: string = settings.env === 'web' ? `?r=${settings.timestamp}` : '';
        const configUrl: string = `${settings.configSrc}${ts}`;

        try {
            this.settings = settings;
            const config: JSON = await httpRequest(configUrl, 'json');
            this.config = parseConfig(config);

            // check if origin is localhost or trusted
            const isLocalhost: boolean = typeof window !== 'undefined' && window.location ? window.location.hostname === 'localhost' : true;
            const whitelist: ?WhiteList = DataManager.isWhitelisted(this.settings.origin || '');
            this.settings.trustedHost = (isLocalhost || !!whitelist) && !this.settings.popup;
            // ensure that popup will be used
            if (!this.settings.trustedHost) {
                this.settings.popup = true;
            }
            // ensure that debug is disabled
            if (this.settings.debug && !this.settings.trustedHost && !whitelist) {
                this.settings.debug = false;
            }
            this.settings.priority = DataManager.getPriority(whitelist);

            const knownHost: ?KnownHost = DataManager.getHostLabel(this.settings.extension || this.settings.origin || '');
            if (knownHost) {
                this.settings.hostLabel = knownHost.label;
                this.settings.hostIcon = knownHost.icon;
            }

            for (const asset of this.config.assets) {
                const json: JSON = await httpRequest(`${asset.url}${ts}`, asset.type || 'json');
                this.assets[ asset.name ] = json;
            }

            for (const protobuf of this.config.messages) {
                const json: JSON = await httpRequest(`${protobuf.json}${ts}`, 'json');
                this.messages[ protobuf.name ] = json;
            }

            // hotfix webusb + chrome:72, allow webextensions
            if (this.settings.popup && this.settings.webusb && this.settings.env !== 'webextension') {
                const browserName = bowser.name.toLowerCase();
                if ((browserName === 'chrome' || browserName === 'chromium')) {
                    if (semvercmp(bowser.version, '72') >= 0) {
                        this.settings.webusb = false;
                    }
                }
            }

            // parse bridge JSON
            this.assets['bridge'] = parseBridgeJSON(this.assets['bridge']);

            // parse coins definitions
            parseCoinsJson(this.assets['coins']);

            // parse firmware definitions
            parseFirmware(this.assets['firmware-t1']);
            parseFirmware(this.assets['firmware-t2']);
        } catch (error) {
            throw error;
        }
    }

    static findMessages(model: number, fw: string): JSON {
        const messages = this.config.messages.find(m => {
            const min = m.range.min[model];
            const max = m.range.max ? m.range.max[model] : fw;
            return (semvercmp(fw, min) >= 0 && semvercmp(fw, max) <= 0);
        });
        return this.messages[messages ? messages.name : 'default'];
    }

    static getMessages(name?: string): JSON {
        return this.messages[name || 'default'];
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

    static isManagementAllowed(): ?WhiteList {
        if (!this.config) return null;
        const uri = parseUri(this.settings.origin);
        if (uri && typeof uri.host === 'string') {
            const parts: Array<string> = uri.host.split('.');
            if (parts.length > 2) {
                // subdomain
                uri.host = parts.slice(parts.length - 2, parts.length).join('.');
            }
            return this.config.management.find(item => (item.origin === this.settings.origin || item.origin === uri.host));
        }
    }

    static getPriority(whitelist: ?WhiteList): number {
        if (whitelist) {
            return whitelist.priority;
        }
        return DEFAULT_PRIORITY;
    }

    static getHostLabel(origin: string): ?KnownHost {
        return this.config.knownHosts.find(host => host.origin === origin);
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

    static getLatestBridgeVersion(): JSON {
        return DataManager.assets.bridge;
    }
}
