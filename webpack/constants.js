const path = require('path');

const ABSOLUTE_BASE = path.normalize(path.join(__dirname, '..'));

module.exports = {
    ABSOLUTE_BASE,
    LIB_NAME: 'TrezorConnect',
    DIST: path.join(ABSOLUTE_BASE, 'build/'),
    SRC: path.join(ABSOLUTE_BASE, 'src/'),
    JS_SRC: path.join(ABSOLUTE_BASE, 'src/js/'),
    HTML_SRC: path.join(ABSOLUTE_BASE, 'src/html/'),
    DATA_SRC: path.join(ABSOLUTE_BASE, 'src/data/'),
    STYLE_SRC: path.join(ABSOLUTE_BASE, 'src/styles/'),
    INLINE_STYLESHEET: path.join(ABSOLUTE_BASE, 'src/js/iframe/'),
    NODE_MODULES: path.join(ABSOLUTE_BASE, 'node_modules/'),
    PORT: 8088,
};
