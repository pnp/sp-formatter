const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'none',
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
        chunkIds: 'named',
        moduleIds: 'named',
        nodeEnv: 'development',
        flagIncludedChunks: false,
        sideEffects: false,
        usedExports: false,
        concatenateModules: false,
        splitChunks: {
            hidePathInfo: false,
            minSize: 10000,
            maxAsyncRequests: Infinity,
            maxInitialRequests: Infinity,
        },
        emitOnErrors: true,
        checkWasmTypes: false,
        minimize: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new webpack.IgnorePlugin(/^((fs)|(path)|(os)|(crypto)|(source-map-support))$/, /vs\/language\/typescript\/lib/),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ]
};