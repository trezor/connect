import {
    versionCompare,
    isValidVersionArray,
    isValidVersionString,
    versionSplit,
    normalizeVersionArray,
} from '../versionUtils';

describe('utils/versionUtils', () => {
    it('versionCompare', () => {
        expect(versionCompare(null, null)).toEqual(0);
        expect(versionCompare('abcd', null)).toEqual(0);
        expect(versionCompare(null, 'abcd')).toEqual(0);
        expect(versionCompare({}, {})).toEqual(0);
        expect(versionCompare('1.2.3', '1.2.3')).toEqual(0);
        expect(versionCompare('1.2.3', '1.2.4')).toEqual(-1);
        expect(versionCompare('1.2.3', '1.2.2')).toEqual(1);
        expect(versionCompare('1.2.a', '1.2.a')).toEqual(0);
        expect(versionCompare('1.2.a', '1.2.4')).toEqual(-1);
        expect(versionCompare('1.2.3', '1.2.a')).toEqual(1);
        expect(versionCompare('1.2.3', '1.2')).toEqual(1);
        expect(versionCompare('1.2', '1.2.1')).toEqual(-1);
        expect(versionCompare([], [])).toEqual(0);
        expect(versionCompare([1], [2])).toEqual(-1);
        expect(versionCompare(['a'], ['b'])).toEqual(0);
        expect(versionCompare([null], [1])).toEqual(-1);
        expect(versionCompare([1], [null])).toEqual(1);
        expect(versionCompare([-1], [1])).toEqual(-1);
        expect(versionCompare([1], [-1])).toEqual(1);
        expect(versionCompare([1, 2, 3], [1, 2, 4])).toEqual(-1);
        expect(versionCompare([1, 2, 3], [1, 2, 2])).toEqual(1);
        expect(versionCompare([1, 2], [1, 2, 4])).toEqual(-1);
        expect(versionCompare([1, 2, 3], [1, 2])).toEqual(1);
        expect(versionCompare([1, 2, 3], [1, 2, 3])).toEqual(0);
    });

    it('isValidVersionArray', () => {
        // Invalid cases
        expect(isValidVersionArray(null)).toEqual(false);
        expect(isValidVersionArray([null])).toEqual(false);
        expect(isValidVersionArray([1, 2, null])).toEqual(false);
        expect(isValidVersionArray([-1])).toEqual(false);
        expect(isValidVersionArray([1, 2, -1])).toEqual(false);
        expect(isValidVersionArray([0, 0, 0])).toEqual(false);
        expect(isValidVersionArray([])).toEqual(false);
        expect(isValidVersionArray([1, 2, 3, 4])).toEqual(false);
        // Valid cases
        expect(isValidVersionArray([1])).toEqual(true);
        expect(isValidVersionArray([1, 2])).toEqual(true);
        expect(isValidVersionArray([1, 2, 3])).toEqual(true);
    });

    it('isValidVersionString', () => {
        // Invalid cases
        expect(isValidVersionString(null)).toEqual(false);
        expect(isValidVersionString('')).toEqual(false);
        expect(isValidVersionString('a')).toEqual(false);
        expect(isValidVersionString('abc')).toEqual(false);
        expect(isValidVersionString('a.b.c')).toEqual(false);
        expect(isValidVersionString('1.2.3.4')).toEqual(false);
        expect(isValidVersionString('1 2 3')).toEqual(false);
        expect(isValidVersionString('a1.2.3')).toEqual(false);
        expect(isValidVersionString('1.2.3a')).toEqual(false);
        expect(isValidVersionString('1.2a.3')).toEqual(false);
        expect(isValidVersionString('1000.0.0')).toEqual(false);
        expect(isValidVersionString('0.0.1000')).toEqual(false);
        // Valid cases
        expect(isValidVersionString('1')).toEqual(true);
        expect(isValidVersionString('1.2')).toEqual(true);
        expect(isValidVersionString('1.2.3')).toEqual(true);
    });

    it('versionSplit', () => {
        // Invalid cases
        expect(versionSplit(null)).toEqual([0, 0, 0]);
        expect(versionSplit('')).toEqual([0, 0, 0]);
        expect(versionSplit('a')).toEqual([0, 0, 0]);
        expect(versionSplit('abc')).toEqual([0, 0, 0]);
        expect(versionSplit('a.b.c')).toEqual([0, 0, 0]);
        expect(versionSplit('1.2.3.4')).toEqual([0, 0, 0]);
        expect(versionSplit('1 2 3')).toEqual([0, 0, 0]);
        expect(versionSplit('a1.2.3')).toEqual([0, 0, 0]);
        expect(versionSplit('1.2.3a')).toEqual([0, 0, 0]);
        expect(versionSplit('1.2a.3')).toEqual([0, 0, 0]);
        expect(versionSplit('1000.0.0')).toEqual([0, 0, 0]);
        expect(versionSplit('0.0.1000')).toEqual([0, 0, 0]);
        // Valid cases
        expect(versionSplit('1')).toEqual([1]);
        expect(versionSplit('1.2')).toEqual([1, 2]);
        expect(versionSplit('1.2.3')).toEqual([1, 2, 3]);
    });

    it('normalizeVersionArray', () => {
        expect(normalizeVersionArray([1])).toEqual([1, 0, 0]);
        expect(normalizeVersionArray([1, 2])).toEqual([1, 2, 0]);
        expect(normalizeVersionArray([1, 2, 3])).toEqual([1, 2, 3]);
    });
});
