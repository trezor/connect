import DataManager from '../../../../data/DataManager';
import configJSON from '../../../../../data/config.json';
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
