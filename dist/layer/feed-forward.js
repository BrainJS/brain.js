'use strict';

var layer = require('./index');
var add = layer.add,
    multiply = layer.multiply,
    random = layer.random,
    sigmoid = layer.sigmoid;


module.exports = function feedForward(settings, input) {
  var height = settings.height;

  var weights = random({ name: 'weights', height: height, width: input.height });
  var biases = random({ name: 'biases', height: height });

  return sigmoid(add(multiply(weights, input), biases));
};