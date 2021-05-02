'use strict';

const config = require('./config/client/coding');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

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
 * Biar mau refresh pada saat compile otomatis
 * Webpack hot reloading using only webpack-dev-middleware. 
 * This allows you to add hot reloading into an existing server without webpack-dev-server.
 * https://github.com/webpack-contrib/webpack-hot-middleware
 */
const entryName = ['main', 'auth'];
for (var a = 0; a < entryName.length; a++) {
  if (typeof webpackConfig.entry[entryName[a]] == 'string') {
    webpackConfig.entry[entryName[a]] = ['webpack-hot-middleware/client', webpackConfig.entry[entryName[a]]];
  } else {
    if (webpackConfig.entry[entryName[a]] != null) {
      webpackConfig.entry[entryName[a]].unshift('webpack-hot-middleware/client');
    } else {
      console.log('WARNING DONNY!!! - this module to watch "' + entryName[a] + '" is not found, CHECK your webpack');
    }
  }
}

webpackConfig.output = {
  path: path.resolve(__dirname, 'views'),
  publicPath: '/',
  filename: '[name].js',
}

/**
 * This module will help you:
 * - Realize what's really inside your bundle
 * - Find out what modules make up the most of its size
 * - Find modules that got there by mistake
 * - Optimize it!
 * https://www.npmjs.com/package/webpack-bundle-analyzer
 */
// webpackConfig.plugins.push(new BundleAnalyzerPlugin())

/**
 * Enables Hot Module Replacement, otherwise known as HMR.
 * Warning ->
 * HMR should never be used in production
 */
webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())

/**
 * The NoEmitOnErrorsPlugin allows you to avoid emitting assets when there are any errors. 
 * Enabled by default, you can disable using optimization.emitOnErrors
 */
webpackConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin())

/**
 * Each key passed into DefinePlugin is an identifier or multiple identifiers joined with.
 * - If the value is a string it will be used as a code fragment.
 * - If the value isn't a string, it will be stringified (including functions).
 * - If the value is an object all keys are defined the same way.
 * - If you prefix typeof to the key, it's only defined for typeof calls.
 */
webpackConfig.plugins[3] = new webpack.DefinePlugin({
  process: {
    env: {
      NODE_ENV: JSON.stringify("coding"),
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
});

module.exports = webpackConfig;
