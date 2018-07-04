/**
 * Babel Starter Kit (https://www.kriasoft.com/babel-starter-kit)
 *
 * Copyright © 2015-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const del = require('del');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const pkg = require('./package.json');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

let promise = Promise.resolve();

// Clean up the output directory
promise = promise.then(() => del(['lib/*']));

// Compile source code into a distributable format with Babel
// ['es', 'cjs', 'umd'].forEach((format) => {
['cjs'].forEach((format) => {
  promise = promise.then(() => rollup.rollup({
    input: './src/js/index.js',
    // external: Object.keys(pkg.dependencies),
    // plugins: [babel(Object.assign(pkg.babel, {
    //   babelrc: false,
    //   exclude: 'node_modules/**',
    //   runtimeHelpers: true,
    //   presets: pkg.babel.presets.map(x => (x === 'latest' ? ['latest', { es2015: { modules: false } }] : x)),
    // }))],
    // experimentalCodeSplitting: true,
    output: {
        file: 'bundle.js',
        format: 'iffe'
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: true,
        }),
        commonjs({
            include: "node_modules/**"
        }),
        // babel({
        //     babelrc: false,
        //     runtimeHelpers: true,
        //     exclude: 'node_modules/**', // only transpile our source code
        //     presets: [
        //         "env", {
        //             modules: false
        //         }
        //     ],
        //     plugins: [
        //         "babel-plugin-transform-class-properties",
        //         "babel-plugin-transform-object-rest-spread",
        //         "babel-plugin-transform-flow-strip-types",
        //         "babel-plugin-add-module-exports",
        //         ["babel-plugin-transform-runtime", {
        //             "polyfill": false,
        //             "regenerator": true
        //         }]
        //     ]
        // }),

        babel({
            runtimeHelpers: true,

            exclude: 'node_modules/**', // only transpile our source code
        })
    ]
  }).then(bundle => {
    console.log("BANDL", bundle.cache.modules[0].id, bundle.cache.modules.length)
    return bundle.write({
    // dest: `lib/${format === 'cjs' ? 'index' : `index.${format}`}.js`,
    file: `./lib/${format === 'cjs' ? 'index' : `index.${format}`}.js`,
    format,

    sourceMap: true,
    moduleName: format === 'umd' ? pkg.name : undefined,
    })
  }));
});

// Copy package.json and LICENSE.txt
promise = promise.then(() => {
  delete pkg.private;
  delete pkg.devDependencies;
  delete pkg.scripts;
  delete pkg.eslintConfig;
  delete pkg.babel;
  delete pkg.bin;
  pkg.main = "foo.js"
  fs.writeFileSync('lib/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
  // fs.writeFileSync('lib/LICENSE.txt', fs.readFileSync('LICENSE.txt', 'utf-8'), 'utf-8');
});

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console
