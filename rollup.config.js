const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
// const cf = require("cross-fetch/polyfill");

module.exports = {
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "cjs",
  },
  plugins: [resolve(), commonjs(), json()],
  // fetch: fetch,
};
