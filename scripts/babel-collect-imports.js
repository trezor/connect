const babel = require('@babel/core');
const path = require('path');
const { readFileSync } = require('fs');
const { sync: resolveSync } = require('resolve');

// npm 'babel-collect-imports' package is using babel@6 and it's not maintained anymore.
// https://github.com/babel-utils/babel-collect-imports
// PR with required update to babel@7 was never accepted.

// This script is used to recursively collect all the internal and external dependencies from an entry point.
// Required by `yarn build:npm` job.

// Will be removed after migration to typescript.

// from babel-collect-imports>babel-file
function createFile(code, opts) {
    const ast = babel.parseSync(code, opts);
    return new babel.File(opts, { code, ast });
}

// from babel-collect-imports>babel-file-loader
function loadFileSync(filePath, parserOpts) {
    const buffer = readFileSync(filePath);
    return createFile(buffer.toString(), {
        filename: filePath,
        parserOpts,
    });
}

// babel-collect-imports src
function getImportSources(filePath, parserOpts, extensions) {
    const importSources = [];
    if (extensions.indexOf(path.extname(filePath).replace('.', '')) > -1) {
        const file = loadFileSync(filePath, parserOpts);
        for (const item of file.path.get('body')) {
            if (item.isImportDeclaration() || (item.isExportDeclaration() && item.node.source)) {
                importSources.push(item.node.source.value);
            }
        }
    }

    return importSources;
}

function resolveImportSourcePathSync(filePath, importSource, resolveOpts) {
    return resolveSync(importSource, { ...resolveOpts, basedir: path.dirname(filePath) });
}

const INTERNAL_MODULE_SOURCE = /^\./;

function collectImportsSync(
    entry,
    options = { extensions: ['js', 'jsx', 'babel'] },
    parserOpts,
    resolveOpts,
) {
    const visited = {};
    const queue = [entry];
    const internal = [];
    const external = [];

    while (queue.length) {
        const filePath = queue.shift();
        const importSources = getImportSources(filePath, parserOpts, options.extensions);

        for (const importSource of importSources) {
            if (INTERNAL_MODULE_SOURCE.test(importSource)) {
                const resolved = resolveImportSourcePathSync(filePath, importSource, resolveOpts);
                if (!visited[resolved]) queue.push(resolved);
            } else {
                external.push(importSource);
            }
        }

        internal.push(filePath);
        visited[filePath] = true;
    }

    return {
        internal,
        external,
    };
}

exports.collectImportsSync = collectImportsSync;
