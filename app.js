"use strict";

const config = require("./config/server/express.js");
const express = require("express");
const logger = require("morgan");

const app = new express();
app.set("view engine", "ejs");
var versionCompile = new Date().getTime();

// ## Middleware
switch (config.env) {
  case 'coding':
  default:
    app.use(logger("dev"));
    var webpack = require("webpack");
    var webpackConfig = require("./webpack.coding.config.js");
    // const DashboardPlugin = require('webpack-dashboard/plugin');
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackHotMiddleware = require("webpack-hot-middleware");
    var compiler = webpack(webpackConfig);
    // compiler.apply(new DashboardPlugin());
    app.use(webpackDevMiddleware(compiler, {
      //logLevel: "warn",
      publicPath: webpackConfig.output.publicPath
    }));
    app.use(webpackHotMiddleware(compiler));
    break;
  case "production":
  case "devserver":
    var webpack = require("webpack");
    var webpackConfig = require("./webpack.config.js");
    if(config.env == "devserver"){
      webpackConfig = require("./webpack.devserver.config.js");
    }
    // const DashboardPlugin = require('webpack-dashboard/plugin');
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackHotMiddleware = require("webpack-hot-middleware");
    // var compiler = webpack(webpackConfig);
    //  compiler.apply(new DashboardPlugin());
    // app.use(
    //   webpackDevMiddleware(compiler, {
    //     logLevel: "warn",
    //     publicPath: webpackConfig.output.publicPath
    //   })
    // );
    // app.use(webpackHotMiddleware(compiler));
    app.use(express.static(`${__dirname}/dist`));
    app.use(express.static(`${__dirname}/dist/public`));
    break;
}
/*
    Jika posisinya development
    Ini harus di bawah webpackDevMiddleware ya!!!
    - Routes
*/
// app.get("/auth/*", function (req, res) {
//   res.render(__dirname + "/views/auth", {date: versionCompile});
//   /* res.sendFile(__dirname + "/views/auth.html"); */
// });

app.get("/*", function (req, res) {
  res.render(__dirname + "/views/v1/dev/index", {date: versionCompile});
  /* res.sendFile(__dirname + "/views/index.html"); */
});

// app.get("/v2/example/*", function (req, res) {
//   res.render(__dirname + "/views/examplev2", {date: versionCompile});
//   /* res.sendFile(__dirname + "/views/examplev2.html"); */
// });

// app.get("/v2/partner/*", function (req, res) {
//   res.render(__dirname + "/views/partnerv2", {date: versionCompile});
//   /* res.sendFile(__dirname + '/views/partnerv2.html'); */
// });

app.listen(config.port, () => console.log(`Server running on port ${config.port}...`));
