'use strict';

const config = require('./config/client/devserver');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

/**
 * Providing the mode configuration option tells webpack to use its built-in optimizations accordingly.
 * String = 'production': 'none' | 'development' | 'production'
 * https://webpack.js.org/configuration/mode/
 */
webpackConfig.mode = "none";

/**
 * This option controls if and how source maps are generated.
 * Use the SourceMapDevToolPlugin for a more fine grained configuration. See the source-map-loader to deal with existing source maps.
 * https://webpack.js.org/configuration/devtool/
 */
webpackConfig.devtool = 'source-map';

/**
 * Each key passed into DefinePlugin is an identifier or multiple identifiers joined with.
 * - If the value is a string it will be used as a code fragment.
 * - If the value isn't a string, it will be stringified (including functions).
 * - If the value is an object all keys are defined the same way.
 * - If you prefix typeof to the key, it's only defined for typeof calls.
 */
webpackConfig.plugins.push(new webpack.DefinePlugin({
  process: {
    env: {
      NODE_ENV: JSON.stringify("devserver"),
      ...(function () {
        /* IMPORTANT JSON stringy all */
        for (var key in config) {
          config[key] = JSON.stringify(config[key]);
        }
        return config;
      })()
    },
    browser: true,
  }
}))

module.exports = webpackConfig;
