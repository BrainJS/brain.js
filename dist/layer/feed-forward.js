'use strict';

var _require = require('./index'),
    add = _require.add,
    multiply = _require.multiply,
    random = _require.random,
    sigmoid = _require.sigmoid;

module.exports = function feedForward(settings, input) {
  var height = settings.height;

  var weights = random({ name: 'weights', height: height, width: input.height });
  var biases = random({ name: 'biases', height: height });

  return sigmoid(add(multiply(weights, input), biases));
};