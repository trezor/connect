/* @flow */

import { httpRequest } from '../env/node/networkUtils';
import { DEFAULT_PRIORITY } from '../data/ConnectSettings';
import { parseCoinsJson } from './CoinInfo';
import { parseFirmware } from './FirmwareInfo';
import { parseBridgeJSON } from './TransportInfo';
import parseUri from 'parse-uri';
import { versionCompare } from '../utils/versionUtils';

import type { ConnectSettings } from '../types';

type WhiteList = {
    priority: number;
    origin: string;
}
type KnownHost = {
    origin: string;
    label?: string;
    icon?: string;
}

type SupportedBrowser = {
    version: number;
    download: string;
    update: string;
}
type WebUSB = {
    vendorId: string;
    productId: string;
}

type Resources = {
    bridge: string;
}
type Asset = {
    name: string;
    type?: string;
    url: string;
}
type ProtobufMessages = {
    name: string;
    range: {
        min: string[];
        max?: string[];
    };
    json: string;
}
export type Config = {
    whitelist: WhiteList[];
    management: WhiteList[];
    knownHosts: KnownHost[];
    webusb: WebUSB[];
    resources: Resources;
    assets: Asset[];
    messages: ProtobufMessages[];
    supportedBrowsers: { [key: string]: SupportedBrowser };
    supportedFirmware: Array<{|
        coinType?: string;
        coin?: string | string[];
        excludedMethods?: string[];
        min?: string[];
        max?: string[];
    |}>;
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

    static async load(settings: ConnectSettings, withAssets: boolean = true) {
        const ts = settings.env === 'web' ? `?r=${settings.timestamp}` : '';
        this.settings = settings;
        const config = await httpRequest(`${settings.configSrc}${ts}`, 'json');
        this.config = parseConfig(config);

        // check if origin is localhost or trusted
        const isLocalhost = typeof window !== 'undefined' && window.location ? window.location.hostname === 'localhost' : true;
        const whitelist = DataManager.isWhitelisted(this.settings.origin || '');
        this.settings.trustedHost = (isLocalhost || !!whitelist) && !this.settings.popup;
        // ensure that popup will be used
        if (!this.settings.trustedHost) {
            this.settings.popup = true;
        }
        // ensure that debug is disabled
        if (!this.settings.trustedHost && !whitelist) {
            this.settings.debug = false;
        }
        this.settings.priority = DataManager.getPriority(whitelist);

        const knownHost: ?KnownHost = DataManager.getHostLabel(this.settings.extension || this.settings.origin || '');
        if (knownHost) {
            this.settings.hostLabel = knownHost.label;
            this.settings.hostIcon = knownHost.icon;
        }

        // hotfix webusb + chrome:72, allow webextensions
        if (this.settings.popup && this.settings.webusb && this.settings.env !== 'webextension') {
            this.settings.webusb = false;
        }

        if (!withAssets) return;

        for (const asset of this.config.assets) {
            const json: JSON = await httpRequest(`${asset.url}${ts}`, asset.type || 'json');
            this.assets[ asset.name ] = json;
        }

        for (const protobuf of this.config.messages) {
            const json: JSON = await httpRequest(`${protobuf.json}${ts}`, 'json');
            this.messages[ protobuf.name ] = json;
        }

        // parse bridge JSON
        parseBridgeJSON(this.assets['bridge']);

        // parse coins definitions
        parseCoinsJson(this.assets['coins']);

        // parse firmware definitions
        parseFirmware(this.assets['firmware-t1'], 1);
        parseFirmware(this.assets['firmware-t2'], 2);
    }

    static getProtobufMessages(version?: number[]): JSON {
        if (!version) return this.messages['default'];
        const model = version[0] - 1;
        const messages = this.config.messages.find(m => {
            const min = m.range.min[model];
            const max = m.range.max ? m.range.max[model] : version;
            return (versionCompare(version, min) >= 0 && versionCompare(version, max) <= 0);
        });
        return this.messages[messages ? messages.name : 'default'];
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

    static isManagementAllowed() {
        if (!this.config) return;
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

    static getPriority(whitelist: ?WhiteList) {
        if (whitelist) {
            return whitelist.priority;
        }
        return DEFAULT_PRIORITY;
    }

    static getHostLabel(origin: string) {
        return this.config.knownHosts.find(host => host.origin === origin);
    }

    static getSettings(key: ?string): any {
        if (!this.settings) return null;
        if (typeof key === 'string') {
            return this.settings[key];
        }
        return this.settings;
    }

    static getDebugSettings(type: string) {
        return false;
    }

    static getConfig() {
        return this.config;
    }
}
