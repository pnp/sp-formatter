const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: {
        background: path.join(__dirname, '../src/background.ts'),
        content_script: path.join(__dirname, '../src/content_script.ts'),
        devtools: path.join(__dirname, '../src/devtools.ts'),
        column_formatting: path.join(__dirname, '../src/column_formatting.ts'),
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
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    }
};
