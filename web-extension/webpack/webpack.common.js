const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: {
    'background': path.join(__dirname, '../src/background/Background.ts'),
    'content': path.join(__dirname, '../src/content/Content.ts'),
    'inject': path.join(__dirname, '../src/content/page/Inject.ts'),
    'inject-legacy': path.join(__dirname, '../src/content/page/legacy/Inject.ts'),
    'sp-context-provider': path.join(__dirname, '../src/content/page/SpPageContextProvider.ts'),
    'popup': path.join(__dirname, '../src/popup/Popup.tsx'),
    'editor.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/editor/editor.worker.js'),
    'json.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/json/json.worker'),
    'css.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/css/css.worker'),
    'html.worker': path.join(__dirname, '../node_modules/monaco-editor/esm/vs/language/html/html.worker')
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
      },
      {
        test: /\.ttf$/,
        use: 'base64-inline-loader?name=[name].[ext]'
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
  },
  plugins: [new ForkTsCheckerWebpackPlugin({
    eslint: {
      files: './src/**/*.{ts,tsx}'
    }
  }),
    new webpack.IgnorePlugin(/^((fs)|(path)|(os)|(crypto)|(source-map-support))$/, /vs\/language\/typescript\/lib/),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.NamedChunksPlugin()]
};
