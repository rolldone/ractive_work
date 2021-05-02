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
        },
        
        /* Old Version
        common: {
          chunks: "initial",
          filename: `[name].bundle.js?v=${pkg.version}`,
          minChunks: 2,
          name: "common",
          reuseExistingChunk: true,
          test: (module, chunks) => {
            return !(chunks.length === 2 && /^(editor|player)$/.test(chunks[0].name) && /^(editor|player)$/.test(chunks[1].name));
          }
        } 
        */
      }
    }
  },
  entry: {
    // auth: [path.resolve(__dirname, "./src/v1/auth")],
    main: [path.resolve(__dirname, "./src/basic/Main")],
    // delivery_auth : [path.resolve(__dirname,"./src/v1/delivery_auth")],
    // delivery_main : [path.resolve(__dirname,"./src/v1/delivery_main")],
    // examplev2: [path.resolve(__dirname, "./src/v2/example")],
    // partnerv2 : [path.resolve(__dirname, './src/v2/partner')],
    // vendor: []
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    /* 
        Kalo pengen express jadi pondasi
    */
    publicPath : '/',
    /* 
        Kalo pengen mandiri
    */
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
        use: "file-loader",
        // query: {
        //   name: "[path][name].[ext]"
        // }
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
    /* 0 */
    new ForkTsCheckerWebpackPlugin({}),
    /* 1 -> Load Html-webpack-plugin */
    new HtmlWebpackPlugin({
      title: 'Lacuisine Admin',
      chunks: [],
      date : new Date().getTime(),
      /* 
      Kalo pake .html pasti error karena kebetulan webpack.
      Untuk extention html di compile pake ractive-loader. Jadi akalin aja
      pake .ejs atau terserah
      */
      template : path.join(__dirname, "views", "v1/prod/index.ejs"),
      filename: path.join(__dirname, "dist", "index.html")
    }),
    /* 2 -> Ini artinya membuatkan folder tujuan pada saat di compile */
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
    // 3 ->
    // new webpack.optimize.OccurrenceOrderPlugin(),
    // in webpack 5 default NODE_ENV is production
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
    new webpack.ProvidePlugin({
      asyncSeries : "async/series"
      // $: "jquery",
      // jQuery: "jquery",
      // moment: "moment",
      // Swal: path.resolve(path.join(__dirname, "src", "assets/sweetalert2/dist/sweetalert2.js")),
      // // jQuery: path.resolve(path.join(__dirname, 'lib', 'own_jquery.js')),
      // // 'window.jQuery': path.resolve(path.join(__dirname, 'lib', 'own_jquery.js')),
      // gettext: path.join(__dirname, "src/base", "Ttag.js"),
      // Arg: path.join(__dirname, "src/assets", "arg/dist/arg.min.js"),
      // asyncjs: "async",
      // NProgress: "nprogress",
      // Pusher: path.join(__dirname, "src/assets", "pusher-js-master/dist/web/pusher.min.js"),
      // _: path.join(__dirname, "src/assets", "lodash/dist/lodash.min.js"),
      // Validator: path.join(__dirname, "src/assets", "validatorjs/validator.js"),
    }),
    //new BundleAnalyzerPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.tsx','.html'],
    alias: {
      // pubsub: "aurelia-event-aggregator",
      // Ractive: "ractive",
      // BaseRactive: path.resolve(path.join(__dirname, "src", "lib/ractive/BaseRactive.js")),
      "@": path.resolve(__dirname, "./src"),
    }
  }
};
