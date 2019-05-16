const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'none',
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: null,
            exclude: /monaco-build/
        })
    ]
});
