'use strict'

const autoprefixer = require('autoprefixer')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const getClientEnvironment = require('./env')
const paths = require('./paths')

const publicPath = '/'
const publicUrl = ''
const env = getClientEnvironment(publicUrl)

// LOADERS CONFIGS
const styleLoader = {
  loader: require.resolve('style-loader'),
}
const postcssLoader = {
  loader: require.resolve('postcss-loader'),
  options: {
    ident: 'postcss',
    plugins: () => [
      require('postcss-flexbugs-fixes'),
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9', // React doesn't support IE8 anyway
        ],
        flexbox: 'no-2009',
      }),
    ],
  },
}
const lessLoader = {
  loader: require.resolve('less-loader'),
  options: {
    sourcemap: false,
    minimize: false,
    modifyVars: Object.assign({}, require(`${paths.appDirectory}/theme.json`)),
  },
}

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('./polyfills'),
    require.resolve('react-error-overlay'),
    paths.appIndexJs,
  ],
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'static/js/bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    publicPath: publicPath,
    devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath),
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules, paths.appSrc].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.ts', '.tsx', '.js', '.json', '.jsx'],
    alias: {
      '@containers': path.resolve(paths.appSrc, 'containers'),
      '@components': path.resolve(paths.appSrc, 'components'),
      '@constants': path.resolve(paths.appSrc, 'constants'),
      '@assets': path.resolve(paths.appSrc, 'assets'),
      '@utils': path.resolve(paths.appSrc, 'utils'),
      '@typings': path.resolve(paths.appSrc, 'typings'),
      '@gql': path.resolve(paths.appSrc, 'gql'),
      '@layouts': path.resolve(paths.appSrc, 'layouts'),
      '@helpers': path.resolve(paths.appSrc, 'helpers'),
      '@src': paths.appSrc,
    },
    plugins: [new ModuleScopePlugin(paths.appSrc)],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: require.resolve('tslint-loader'),
        enforce: 'pre',
        include: paths.appSrc,
      },
      {
        test: /\.js$/,
        loader: require.resolve('source-map-loader'),
        enforce: 'pre',
        include: paths.appSrc,
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/fonts/[name]___[hash].[ext]',
        },
      },
      {
        test: /(config|phone_codes).json$/,
        loader: require.resolve('file-loader'),
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /locales.*\.json$/,
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/locales/[name].[hash:8].[ext]',
        },
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.(ts|tsx)$/,
        include: paths.appSrc,
        use: [
          require.resolve('babel-loader'),
          {
            loader: require.resolve('ts-loader'),
            options: {
              configFile: `${paths.appDirectory}/tsconfig.json`,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          styleLoader,
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 2,
            },
          },
          postcssLoader,
        ],
      },
      {
        test: /\.less$/,
        include: paths.appDirectory,
        exclude: /node_modules\/antd/,
        use: [
          styleLoader,
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: true,
              minimize: false,
              sourcemap: false,
              importLoaders: 2,
              localIdentName: '[name]__[local]___[hash:base64:5]',
            },
          },
          postcssLoader,
          lessLoader,
        ],
      },
      {
        test: /\.less$/,
        include: /node_modules\/antd/,
        use: [
          styleLoader,
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 2,
              minimize: false,
              sourcemap: false,
            },
          },
          postcssLoader,
          lessLoader,
        ],
      },
      // ** STOP ** Are you adding a new loader?
      // Remember to add the new extension(s) to the "url" loader exclusion list.
    ],
  },
  plugins: [
    // Makes some environment variables available in index.html.
    // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In development, this will be an empty string.
    new InterpolateHtmlPlugin(env.raw),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin({
      multiStep: false,
    }),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
}
