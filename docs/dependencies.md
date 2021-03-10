Webpack:
Since `webpack@5` auto polyfills for `nodejs` are not provided.
see https://webpack.js.org/blog/2020-10-10-webpack-5-release/#automatic-nodejs-polyfills-removed
List of essential libraries to produce build:

- assert (polyfill)
- crypto-browserify (polyfill)
- css-loader
- html-webpack-plugin
- less
- less-loader
- less-plugin-*
- mini-css-extract-plugin
- process (polyfill)
- stream-browserify (polyfill)
- style-loader
- terser-webpack-plugin
- util (polyfill)
- webpack-*
- worker-loader