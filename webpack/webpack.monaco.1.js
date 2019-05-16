const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        "monaco.min": path.join(__dirname, '../monaco/index.js')
    },
    output: {
        globalObject: 'window',
        filename: '[name].js',
        path: path.resolve(__dirname, '../app/monaco-editor'),
        libraryTarget: 'umd',
        library: 'monaco'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.worker\.js$/,
            use: {
                loader: 'worker-loader',
                options: { inline: true, fallback: false }
            }
        }]
    },
    plugins: [
        new webpack.IgnorePlugin(/^((fs)|(path)|(os)|(crypto)|(source-map-support))$/, /vs\/language\/typescript\/lib/),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ],
};