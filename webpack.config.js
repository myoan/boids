var path = require('path');
var pathToPhaser = path.join(__dirname, '/mode_modules/pahser/');
var phaser = path.join(pathToPhaser, 'dist/phaser.js');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./app.ts",
    watch: true,
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".ts", ".tsx", ".js"]
    },
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        { test: /\.tsx?$/, loader: "ts-loader" }
      ]
    }
  };
