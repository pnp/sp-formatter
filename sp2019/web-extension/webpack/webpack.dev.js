const merge = require('webpack-merge').merge;
const common = require('./webpack.common.js');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const config = require('./../mv3-hot-reload.config');

module.exports = merge(common, {
  entry: {
    'background': ['mv3-hot-reload/background', common.entry['background']],
    'content': ['mv3-hot-reload/content', common.entry['content']],
  },
  mode: 'none',
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: null,
      exclude: /monaco-build/
    }),
    new ESLintPlugin({
      lintDirtyModulesOnly: true,
      files: './src/**/*.{ts,tsx}'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.MV3_HOT_RELOAD_PORT': JSON.stringify(config.port)
    })
  ]
});
