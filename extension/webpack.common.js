const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    popup: path.resolve("src/popup/index.jsx"),
    background: path.resolve("src/background/service-worker.js"),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve("src/static/manifest.json"),
          to: path.resolve("dist"),
        },
        {
          from: path.resolve("src/static/icons"),
          to: path.resolve("dist"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve("src/popup/popup.html"),
      filename: "popup.html",
      chunks: ["popup"],
    }),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve("dist"),
    clean: true,
  },
};
