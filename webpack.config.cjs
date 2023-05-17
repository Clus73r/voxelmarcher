const path = require("path");

module.exports = {
  context: __dirname,
  mode: "production",
  devtool: "source-map",
  entry: "./src/main.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.wgsl$/,
        use: {
          loader: "ts-shader-loader",
        },
      },
      {
        test: /\.(jpg|png|hdr|exr)$/,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
};
