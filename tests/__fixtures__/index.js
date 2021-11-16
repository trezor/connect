import cardanoGetAddressDerivations from './cardanoGetAddressDerivations';

let fixtures = [
    cardanoGetAddressDerivations,
];

// if env variable TESTS_FIRMWARE, filter out those tests that do not match it
const firmware = process.env.TESTS_FIRMWARE;
if (firmware) {
    const [actualMajor, actualMinor, actualPatch] = firmware.split('.');
    fixtures = fixtures.map(f => {
        f.tests = f.tests.filter(t => {
            if (!t.setup || !t.setup.firmware) {
                return true;
            }
            return t.setup.firmware.some(fw => {
                const [fromMajor, fromMinor, fromPatch] = fw[0].split('.');
                const [toMajor, toMinor, toPatch] = fw[1].split('.');
                return (
                    actualMajor >= fromMajor &&
                    actualMinor >= fromMinor &&
                    actualPatch >= fromPatch &&
                    actualMajor <= toMajor &&
                    actualMinor <= toMinor &&
                    actualPatch <= toPatch
                );
            });
        });
        return f;
    });
}

const includedMethods = process.env.TESTS_INCLUDED_METHODS;
const excludedMethods = process.env.TESTS_EXCLUDED_METHODS;
if (includedMethods) {
    const methodsArr = includedMethods.split(',');
    fixtures = fixtures.filter(f => methodsArr.some(includedM => includedM === f.method));
} else if (excludedMethods) {
    const methodsArr = excludedMethods.split(',');
    fixtures = fixtures.filter(f => !methodsArr.includes(f.method));
}

// sort by mnemonic to avoid emu re-loading
const result = fixtures.sort((a, b) => {
    if (a.setup.mnemonic > b.setup.mnemonic) return 1;
    if (b.setup.mnemonic > a.setup.mnemonic) return -1;
    return 0;
});

export default result;
