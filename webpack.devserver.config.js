'use strict';

const config = require('./config/client/devserver');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
webpackConfig.mode = "none";
webpackConfig.devtool = 'source-map';
webpackConfig.plugins.push(new webpack.DefinePlugin({
  process: {
    env: {
      NODE_ENV: JSON.stringify("devserver"),
      ...(function(){
        /* IMPORTANT JSON stringy all */
        for(var key in config){
          config[key] = JSON.stringify(config[key]);
        }
        return config;
      })()
    },
    browser: true,
  }
})),
module.exports = webpackConfig;
