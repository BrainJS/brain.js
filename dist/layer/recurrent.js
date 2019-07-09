'use strict';

var layer = require('.');
var relu = layer.relu,
    add = layer.add,
    multiply = layer.multiply,
    random = layer.random,
    zeros = layer.zeros;


module.exports = function (settings, input, recurrentInput) {
  var height = settings.height;


  recurrentInput.setDimensions(1, height);

  // wxh
  var weight = random({ name: 'weight', height: height, width: input.height });
  // whh
  var transition = random({ name: 'transition', height: height, width: height });
  // bhh
  var bias = zeros({ name: 'bias', height: height });

  return relu(add(add(multiply(weight, input), multiply(transition, recurrentInput)), bias));
};