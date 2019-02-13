const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = () => {
  const publicPath = '/';
  return {
    bail: false,
    devtool: 'cheap-module-source-map',
    output: {
      pathinfo: true,
      filename: 'static/js/bundle.js',
      chunkFilename: 'static/js/[name].chunk.js',
      publicPath: publicPath
    },
    devServer: {
      historyApiFallback: true,
      inline: true,
      hot: true
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new CaseSensitivePathsPlugin()
    ].filter(Boolean)
  }
}