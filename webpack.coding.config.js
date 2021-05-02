'use strict';

const config = require('./config/client/coding');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
webpackConfig.mode = "none";
webpackConfig.devtool = 'source-map';
/* Biar mau refresh pada saat compile otomatis */
const entryName = ['main','auth'];

for(var a=0;a<entryName.length;a++){
  if (typeof webpackConfig.entry[entryName[a]] == 'string') {
    webpackConfig.entry[entryName[a]] = ['webpack-hot-middleware/client', webpackConfig.entry[entryName[a]]];
  } else {
    if(webpackConfig.entry[entryName[a]] != null){
      webpackConfig.entry[entryName[a]].unshift('webpack-hot-middleware/client');
    }else{
      console.log('WARNING DONNY!!! - this module to watch "'+entryName[a]+'" is not found, CHECK your webpack');
    }
  }
}
webpackConfig.output = {
  path: path.resolve(__dirname, 'views'),
  publicPath: '/',
  filename: '[name].js',}
// webpackConfig.entry.unshift('webpack-hot-middleware/client');
/* Kalo jalankan aplikasi lebih dari satu sebaiknya matikan  */
// webpackConfig.plugins.push(new BundleAnalyzerPlugin())
// webpackConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin())
webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
webpackConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin())
webpackConfig.plugins[3] = new webpack.DefinePlugin({
  process: {
    env: {
      NODE_ENV: JSON.stringify("coding"),
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
});
webpackConfig.plugins.push(new webpack.LoaderOptionsPlugin({
  minimize: false,
  debug: true
}))
module.exports = webpackConfig;
