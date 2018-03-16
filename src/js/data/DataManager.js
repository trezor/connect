/* @flow */
'use strict';

import { httpRequest } from '../utils/networkUtils';
import type { ConnectSettings } from '../entrypoints/ConnectSettings';
import { parseCoinsJson } from '../backend/CoinInfo';
import { Promise } from 'es6-promise';
import { getOrigin } from '../utils/networkUtils';
import parseUri from 'parse-uri';

type WebUSB = {
    vendorId: string;
    productId: string;
}
type Config = {
    whitelist: Array<string>;
    webusb: Array<WebUSB>;
}

// transform json into flow typed object
const parseConfig = (json: JSON): Config => {
    const config: Config = {
        whitelist: [],
        webusb: [],
    }
    if (json.hasOwnProperty('whitelist') && typeof json.whitelist === 'object' && Array.isArray(json.whitelist)) {
        config.whitelist = json.whitelist;
    }
    if (json.hasOwnProperty('webusb') && typeof json.webusb === 'object' && Array.isArray(json.webusb)) {
        config.webusb = json.webusb;
    }
    return config;
}

export default class DataManager {
    static config: Config;
    static releases: JSON;
    static settings: ConnectSettings;
    static cachePassphrase: boolean = false;

    static async load(settings: ConnectSettings): Promise<void> {
        const configUrl: string = `${settings.configSrc}?r=${ new Date().getTime() }`;
        const coinsUrl: string = settings.coinsSrc;
        const releasesUrl: string = settings.firmwareReleasesSrc;

        try {
            const config: JSON = await httpRequest(configUrl, 'json');
            const coins: JSON = await httpRequest(coinsUrl, 'json');
            const releases: JSON = await httpRequest(releasesUrl, 'json');

            this.config = parseConfig(config);
            this.releases = releases;
            this.settings = settings;

            // check if origin is trusted
            // settings.origin = "chrome-extension://imloifkgjagghnncjkhggdhalmcnfklk";
            this.settings.trustedHost = DataManager.isWhitelisted(this.settings.origin || "");

            parseCoinsJson(coins);
        } catch (error) {
            // throw new Error('Cannot load config', error);
            throw error;
        }
    }

    static isWhitelisted(origin: string): boolean {
        const uri = parseUri(origin);
        if (uri && typeof uri.host === 'string') {
            const parts: Array<string> = uri.host.split('.');
            if (parts.length > 2) {
                // subdomain
                uri.host = parts.slice(parts.length - 2, parts.length).join('.');
            }
            const isWhitelisted: ?string = this.config.whitelist.find(url => (url === origin || url === uri.host));
            if (isWhitelisted) {
                return true;
            }
        }
        return false;
    }

    static hasPermissionToRead(): boolean {
        return false;
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

    static getTransportConfigURL(): string {
        // if (this.json && this.json.app && this.json.app.transport_url) {
        //     return this.json.app.transport_url;
        // }
        // return "https://wallet.trezor.io/data/config_signed.bin";
        return 'config_signed.bin';
    }

    static isPassphraseCached(status: ?boolean): boolean {
        if (typeof status === 'boolean') {
            this.cachePassphrase = status;
        }
        return this.cachePassphrase; // this.json.device.cachePassphrase;
    }
}
