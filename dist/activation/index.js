'use strict';

var leakyRelu = require('./leaky-relu');
var relu = require('./relu');
var sigmoid = require('./sigmoid');
var tanh = require('./tanh');

module.exports = { leakyRelu: leakyRelu, relu: relu, sigmoid: sigmoid, tanh: tanh };