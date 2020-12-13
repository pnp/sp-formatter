const merge = require('webpack-merge').merge;
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new BundleAnalyzerPlugin({ generateStatsFile: true, statsFilename: "../../analyze/stats.json", openAnalyzer: false, analyzerMode: "static", reportFilename: "../../analyze/report.html" })
    ]
});