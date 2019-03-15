const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const safePostCssParser = require("postcss-safe-parser");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("./paths");

module.exports = () => {
  const publicPath = "/";
  return {
    bail: true,
    devtool: false,
    output: {
      path: paths.appBuild,
      pathinfo: false,
      filename: "static/js/[name].[chunkhash:8].js",
      chunkFilename: "static/js/[name].[chunkhash:8].chunk.js",
      publicPath: publicPath
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          cache: true,
          sourceMap: true
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: true
          }
        })
      ],
      splitChunks: {
        chunks: "all",
        name: true
      },
      runtimeChunk: true
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "static/css/[name].[contenthash:8].css",
        chunkFilename: "static/css/[name].[contenthash:8].chunk.css"
      })
    ]
  };
};
