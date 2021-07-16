const compareVersions = require('compare-versions');

if (compareVersions.compare(process.argv[2], process.argv[3], '>')) {
    process.exit(0);
}
console.log(
    'trezor-connect package.json version is the same or lower than the npm registry version.',
);
process.exit(1);
