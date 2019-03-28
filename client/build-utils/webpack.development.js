const webpack = require("webpack");
const SERVER_URL = require("../config").serverPath;

module.exports = () => {
  const publicPath = "/";
  return {
    bail: false,
    devtool: "cheap-module-source-map",
    output: {
      pathinfo: true,
      filename: "static/js/bundle.js",
      chunkFilename: "static/js/[name].chunk.js",
      publicPath: publicPath
    },
    devServer: {
      historyApiFallback: true,
      inline: true,
      hot: true,
      open: true,
      overlay: true,
      proxy: {
        "/srv_chat": {
          target: SERVER_URL,
          ws: true
        },
        "/api": {
          target: SERVER_URL,
          pathRewrite: { "^/api": "" }
        }
      }
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
  };
};
