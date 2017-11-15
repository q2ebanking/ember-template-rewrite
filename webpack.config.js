const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

const COVERAGE = process.env.NODE_ENV === 'coverage';

const outputDir = path.join(__dirname, 'dist');

module.exports = {
  entry: './index.ts',
  resolve: {
    extensions: ['.ts', '.pegjs'],
    alias: {
      'test': path.resolve(__dirname, 'test/'),
      'ember-template-rewrite': path.resolve(__dirname, 'src/')
    }
  },
  output: {
    path: outputDir,
    filename: 'ember-template-rewrite.js',
    library: '',
    libraryTarget: 'commonjs',
    libraryExport: 'default'
  },
  module: {
    loaders: [
      { test: /\.ts$/, use: 'awesome-typescript-loader' },
      { test: /\.pegjs$/, use: 'raw-loader' },
    ],
    rules: [].concat(
      COVERAGE ? {
        test: /\.(js|ts)/,
        include: path.resolve('src'),
        loader: 'istanbul-instrumenter-loader'
      }: [],
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loaders: ['awesome-typescript-loader?{ useBabel: true }'],
      }
    ),
  },
  target: 'node',
  externals: [nodeExternals()],
};
