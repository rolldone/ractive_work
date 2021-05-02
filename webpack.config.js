const autoprefixer = require("autoprefixer");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require("webpack");
const config = require('./config/client/production');

var pkg = {
  version: new Date().getTime()
};
module.exports = {
  mode: "production",
  optimization: {
    splitChunks: {
      chunks: "async",
      cacheGroups: {
        heavy: {
          chunks: "initial",
          filename: `[name].bundle.js`,
          minChunks: 2,
          name: "heavy",
          reuseExistingChunk: true,
          test: (module, chunks) => chunks.length === 2 && /^(editor|player)$/.test(chunks[0].name) && /^(editor|player)$/.test(chunks[1].name)
        },
        common : {
          chunks: "initial",
          name: "common",
          minChunks: 1,
          filename: `[name].js`,
          reuseExistingChunk: true,
          test: /[\/[\\/]node_modules[\\/]((?!moment|jquery).*)[\\/]/
        },
        common2 : {
          chunks: "initial",
          name: "common2",
          minChunks: 1,
          filename: `[name].js`,
          reuseExistingChunk: true,
          test: /[\\/]node_modules[\\/]((moment|jquery).*)[\\/]/
        },
        common3 : {
          chunks: "initial",
          name: "common3",
          minChunks: 1,
          filename: `[name].js`,
          reuseExistingChunk: true,
          test: /[\\/]assets[\\/]((?!semantic).*)[\\/]/
        },
        common4 : {
          chunks: "initial",
          name: "common4",
          minChunks: 1,
          filename: `[name].js`,
          reuseExistingChunk: true,
          test: /[\\/]assets[\\/]((semantic).*)[\\/]/
        }
      }
    }
  },
  entry: {
    // auth: [path.resolve(__dirname, "./src/v1/auth")],
    main: [path.resolve(__dirname, "./src/basic/Main")],
    // vendor: []
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    /* Kalo pengen express jadi pondasi */
    publicPath : '/',
    /* Kalo pengen mandiri */
    // publicPath: "/dist",
    filename: "[name].js",
    chunkFilename : '[id].[hash].js'
    // chunkFilename : '[name].[hash].js'
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true 
            }
          }
        ],
        exclude: /node_modules/,
        
      },
      {
        test: /\.ts?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true 
            }
          }
        ],
        exclude: /node_modules/,
        
      },
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2|svg)(\?.*)?$/,
        use: "file-loader"
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader"
        ]
      },
      { test: /\.jade$/, use: "ractive-loader!jade-html-loader" },
      { test: /\.html$/i, use: ['html-loader'] },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "file-loader"
          },
          {
            loader: "svgo-loader",
            options: {
              plugins: [
                {
                  removeTitle: true
                },
                {
                  removeDoctype: true
                },
                {
                  convertColors: {
                    shorthex: false
                  }
                },
                {
                  convertPathData: false
                }
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    /** 0 -> 
     * Features
     * Speeds up TypeScript type checking and ESLint linting (by moving each to a separate process) 🏎
     * Supports modern TypeScript features like project references and incremental mode ✨
     * Supports Vue Single File Component ✅ 
     * Displays nice error messages with the code frame formatter 🌈
     * https://www.npmjs.com/package/fork-ts-checker-webpack-plugin
     */
    new ForkTsCheckerWebpackPlugin({}),
    /** 1 ->
     * The HtmlWebpackPlugin simplifies creation of HTML files to serve your webpack bundles. 
     * This is especially useful for webpack bundles that include a hash in the filename which changes every compilation. 
     * You can either let the plugin generate an HTML file for you, supply your own template using lodash templates, or use your own loader.
     * https://webpack.js.org/plugins/html-webpack-plugin/
     */
    new HtmlWebpackPlugin({
      title: 'Ractive Work',
      chunks: [],
      date : new Date().getTime(),
      /**
       * Kalo pake .html pasti error karena kebetulan webpack.
       * Untuk extention html di compile pake ractive-loader. Jadi akalin aja
       * pake .ejs atau terserah karena biar bisa passing value dengan mudah
       * */
      template : path.join(__dirname, "views", "v1/prod/index.ejs"),
      filename: path.join(__dirname, "dist", "index.html")
    }),
    /** 2 ->
     * Copies individual files or entire directories, 
     * which already exist, to the build directory
     * https://webpack.js.org/plugins/copy-webpack-plugin/
     */
    new CopyPlugin({
      patterns : [
        // { from: 'src/assets/v1/img', to: 'public/img' },
        // { from: 'src/assets/ionicons', to: 'public/ionicons' },
        // { from: 'src/assets/semantic', to: 'public/semantic' },
        // { from: 'node_modules/leaflet/dist/images', to: 'public/leaflet/images'},
        // { from: 'src/assets/v2/img', to: 'public/v2/img' },
        { from: '_redirects', to : '' }
      ]
    }),
    /** 3 ->
     * Each key passed into DefinePlugin is an identifier or multiple identifiers joined with.
     * - If the value is a string it will be used as a code fragment.
     * - If the value isn't a string, it will be stringified (including functions).
     * - If the value is an object all keys are defined the same way.
     * - If you prefix typeof to the key, it's only defined for typeof calls.
     * https://webpack.js.org/plugins/copy-webpack-plugin/
     */
    new webpack.DefinePlugin({
      process: {
        env: {
          NODE_ENV: JSON.stringify("production"),
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
    }),
    /** 4 ->
     * Automatically load modules instead of having to import or require them everywhere.
     * https://webpack.js.org/plugins/provide-plugin/
     */
    new webpack.ProvidePlugin({
      asyncSeries : "async/series"
    }),
    /** 5 ->
     * This module will help you:
     * - Realize what's really inside your bundle
     * - Find out what modules make up the most of its size
     * - Find modules that got there by mistake
     * - Optimize it!
     * https://www.npmjs.com/package/webpack-bundle-analyzer
     */
    // new BundleAnalyzerPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.tsx','.html'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  }
};
