const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    'index': path.join(__dirname, '../src/monaco/index.js'),
    'editor.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
    'json.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/json/json.worker'),
    'css.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/css/css.worker'),
    'html.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/html/html.worker')
  },
  output: {
    globalObject: 'self',
    filename: '[name].js',
    path: path.resolve(__dirname, '../app/dist/monaco'),
    libraryTarget: 'umd'
  },
  performance: {
    hints: false
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },
    {
      test: /\.ttf$/,
      use: 'base64-inline-loader?name=[name].[ext]'
    }]
  },
  optimization: {
    minimize: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new webpack.IgnorePlugin(/^((fs)|(path)|(os)|(crypto)|(source-map-support))$/, /vs\/language\/typescript\/lib/),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.NamedChunksPlugin()
  ]
};
