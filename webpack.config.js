var webpack = require('webpack');
var path = require('path');

var SRC_DIR = path.resolve(__dirname, 'src');
var OUT_DIR = path.resolve(__dirname);

var config = {
  entry: SRC_DIR + '/main.js',
  output: {
    path: OUT_DIR,
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: SRC_DIR,
        loader: 'babel',
      },
    ],
  },
  devtool: 'inline-source-map',
};

module.exports = config;
