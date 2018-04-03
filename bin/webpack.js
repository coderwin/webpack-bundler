#!/usr/bin/env node

const path = require('path');
const argv = require('yargs').argv;
const webpack = require('../lib/webpack');

// webpack 配置文件
const defaultWebpackConfigPath = argv.config || 'webpack.config.js';
const config = require(path.resolve(defaultWebpackConfigPath));

webpack(config);
