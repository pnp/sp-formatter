const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        background: path.join(__dirname, '../src/background.ts'),
        content_script: path.join(__dirname, '../src/content_script.ts'),
        exec_script: path.join(__dirname, '../src/exec_script.ts'),
    },
    output: {
        path: path.join(__dirname, '../app/js'),
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
            },
            {
				"test": "/\\.js$/",
				"enforce": "pre",
				"use": "source-map-loader"
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
                    test: /\@timkendrick[\\/]monaco-editor/,
                    name: 'monaco-build',
                    enforce: true
                }
            }
        }
    }
};
