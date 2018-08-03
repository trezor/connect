// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import localResolve from 'rollup-plugin-local-resolve';
import babel from 'rollup-plugin-babel';
import flow from 'rollup-plugin-flow';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './src/js/index.js',
    output: {
        file: 'bundle.js',
        format: 'umd',
        name: 'TrezorConnect',
        exports: 'named'
    },
    onwarn: function (message) {
        // Suppress this error message... there are hundreds of them. Angular team says to ignore it.
        // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
        // if (/`this` has been rewritten to `undefined`/.test(message)) {
        if (message.code === 'THIS_IS_UNDEFINED') {
            return;
        }
        console.error(message);
    },
    plugins: [

        resolve({
            browser: true,
            preferBuiltins: false,
        }),
        commonjs({
            include: "node_modules/**"
        }),
        localResolve(),
        flow(),
        babel({
            babelrc: false,
            runtimeHelpers: true,
            exclude: 'node_modules/**',
            presets: [['env', { modules: false }]],
            plugins: [
                "babel-plugin-transform-class-properties",
                "babel-plugin-transform-object-rest-spread",
                "babel-plugin-transform-flow-strip-types",
                "babel-plugin-add-module-exports",
                ["babel-plugin-transform-runtime", {
                    "polyfill": true,
                    "regenerator": true
                }]
            ]
    }),
    ]
};
