const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: {
    'background': path.join(__dirname, '../src/background/Background.ts'),
    'content': path.join(__dirname, '../src/content/Content.ts'),
    'inject': path.join(__dirname, '../src/content/page/Inject.ts'),
    'popup': path.join(__dirname, '../src/popup/Popup.tsx'),
    'editor.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
    'json.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/json/json.worker'),
    'css.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/css/css.worker'),
    'html.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/html/html.worker')
  },
  stats: {
    all: false,
    colors: true,
    errors: true,
    warnings: true,
    timings: true,
    entrypoints: true
  },
  output: {
    path: path.join(__dirname, '../app/dist'),
    filename: '[name].js',
    chunkFilename: "[name].chunk.js"
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        type: 'asset/inline'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  optimization: {
    moduleIds: 'named',
    chunkIds: 'named',
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          chunks: 'all',
          test: /dist[\\/]monaco/,
          name: 'monaco-build',
          enforce: true
        }
      }
    }
  },
  plugins: [new ForkTsCheckerWebpackPlugin(),
  new webpack.IgnorePlugin({
    resourceRegExp: /^((fs)|(path)|(os)|(crypto)|(source-map-support))$/,
    contextRegExp: /vs\/language\/typescript\/lib/
  }),
  new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1
  })]
};
