import { versionCompare } from '../arrayUtils';

describe('utils/arrayUtils', () => {
    it('versionCompare', () => {
        expect(versionCompare(null, null)).toEqual(0);
        expect(versionCompare('abcd', null)).toEqual(0);
        expect(versionCompare(null, 'abcd')).toEqual(0);
        expect(versionCompare({}, {})).toEqual(0);
        expect(versionCompare('1.2.3', '1.2.3')).toEqual(0);
        expect(versionCompare('1.2.3', '1.2.4')).toEqual(-1);
        expect(versionCompare('1.2.3', '1.2.2')).toEqual(1);
        expect(versionCompare('1.2.3', '1.2')).toEqual(1);
        expect(versionCompare('1.2', '1.2.1')).toEqual(-1);
        expect(versionCompare([], [])).toEqual(0);
        expect(versionCompare([1], [2])).toEqual(-1);
        expect(versionCompare(['a'], ['b'])).toEqual(0);
        expect(versionCompare([null], [1])).toEqual(-1);
        expect(versionCompare([1], [null])).toEqual(1);
        expect(versionCompare([1, 2, 3], [1, 2, 4])).toEqual(-1);
        expect(versionCompare([1, 2, 3], [1, 2, 2])).toEqual(1);
    });
});
