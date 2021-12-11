const merge = require('webpack-merge').merge;
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new ESLintPlugin({
      files: './src/**/*.{ts,tsx}'
    }),
    new BundleAnalyzerPlugin({ generateStatsFile: true, statsFilename: "../../analyze/stats.json", openAnalyzer: false, analyzerMode: "static", reportFilename: "../../analyze/report.html" })
  ]
});
