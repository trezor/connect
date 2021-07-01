import packageJSON from '../package.json';

// Verify that dependencies listed in packageJSON.extendedDependencies (used in npm-extended build)
// are corresponding with real dependencies

Object.keys(packageJSON.extendedDependencies).forEach(pkg => {
    const version = packageJSON.extendedDependencies[pkg];
    const dependency = packageJSON.dependencies[pkg] || packageJSON.devDependencies[pkg];
    if (!dependency) {
        throw new Error(`${pkg} not found in package.json dependencies or devDependencies`);
    }
    if (version !== dependency) {
        throw new Error(`${pkg} version mismatch ${version} != ${dependency}`);
    }
});
