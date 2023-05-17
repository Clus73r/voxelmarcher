// const path = require('path')
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const context = __dirname;
export const mode = "production";
export const devtool = "source-map";
export const entry = "./src/main.ts";
export const output = {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/"
};
export default module = {
    rules: [
        {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: {
                loader: "ts-loader"
            }
        },
        {
            test: /\.wgsl$/,
            use: {
                loader: "ts-shader-loader"
            }
        },
        {
            test: /\.(jpg|png|hdr|exr)$/,
            type: 'asset/inline'
        }
    ]
};
export const resolve = {
    extensions: [".ts"]
};