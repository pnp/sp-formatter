const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        "background": path.join(__dirname, '../src/background/background.ts'),
        "content": path.join(__dirname, '../src/content/content_script.ts'),
        "inject": path.join(__dirname, '../src/content/exec_script.ts')
    },
    output: {
        path: path.join(__dirname, '../app/dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: 'all',
                    test: /dist[\\/]monaco/,
                    name: 'monaco-build',
                    enforce: true
                }
            }
        }
    }
};
