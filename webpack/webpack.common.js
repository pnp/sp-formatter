const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    entry: {
        'background': path.join(__dirname, '../src/background/Background.ts'),
        'content': path.join(__dirname, '../src/content/Content.ts'),
        'inject': path.join(__dirname, '../src/content/page/Inject.ts'),
        'popup': path.join(__dirname, '../src/popup/Popup.tsx')
    },
    output: {
        path: path.join(__dirname, '../app/dist'),
        filename: '[name].js'
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
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    optimization: {
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
    plugins: [new ForkTsCheckerWebpackPlugin({
        eslint: {
            files: './src/**/*.{ts,tsx}'
        }
    })]
};
