import { DataManager } from '@trezor/connect-common';
import configJSON from '@trezor/connect-common/lib/files/config.json';
import { validateParams, getFirmwareRange } from '../paramsValidator';
import * as fixtures from '../__fixtures__/paramsValidator';

describe('helpers/paramsValidator', () => {
    describe('validateParams', () => {
        fixtures.validateParams.forEach(f => {
            it(f.description, () => {
                if (!f.success) {
                    expect(() =>
                        validateParams({ param: f.value }, [{ name: 'param', ...f }]),
                    ).toThrow();
                } else {
                    expect(() =>
                        validateParams({ param: f.value }, [{ name: 'param', ...f }]),
                    ).not.toThrow();
                }
            });
        });
    });

    console.log('DataManager', DataManager.getConfig);

    describe('getFirmwareRange', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        fixtures.getFirmwareRange.forEach(f => {
            it(f.description, () => {
                jest.spyOn(DataManager, 'getConfig').mockImplementation(
                    () => f.config || configJSON,
                );
                expect(getFirmwareRange(...f.params)).toEqual(f.result);
            });
        });
    });
});
