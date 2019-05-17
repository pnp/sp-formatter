const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'none',
    entry: {
        "index": path.join(__dirname, '../app/js/monaco/index.js'),
        "editor.worker": path.join(__dirname, '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
        "json.worker": path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/json/json.worker'),
        "css.worker": path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/css/css.worker'),
        "html.worker": path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/html/html.worker'),
        "ts.worker": path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker')
    },
    output: {
        globalObject: 'self',
        filename: '[name].js',
        path: path.resolve(__dirname, '../app/js/monaco/dist'),
        libraryTarget: 'umd'
    },
    performance: {
        hints: false
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new webpack.IgnorePlugin(/^((fs)|(path)|(os)|(crypto)|(source-map-support))$/, /vs\/language\/typescript\/lib/),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        })
    ]
};