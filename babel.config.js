module.exports = api => {
    api.cache(true);
    const presets = [
        [
            '@babel/preset-env',
            {
                useBuiltIns: false,
                loose: true,
                debug: true,
            },
        ],
        '@babel/preset-flow',
    ];

    const plugins = [
        '@babel/plugin-transform-flow-strip-types',
        ['@babel/plugin-proposal-class-properties', { loose: false }],
        ['@babel/plugin-proposal-private-methods', { loose: false }],
        ['@babel/plugin-proposal-private-property-in-object', { loose: false }],
        '@babel/plugin-proposal-object-rest-spread',
        [
            '@babel/plugin-transform-runtime',
            {
                regenerator: true,
            },
        ],
    ];

    return {
        presets,
        plugins,
        sourceType: 'unambiguous', // This is required by karma tests (allow websocket-client module.exports = ... syntax)
    };
};
