'use strict';

var layer = require('.');
var add = layer.add,
    multiply = layer.multiply,
    random = layer.random,
    target = layer.target,
    zeros = layer.zeros;


module.exports = function (settings, inputLayer) {
  var height = settings.height;

  var outputGate = random({ height: height, width: inputLayer.height });
  var output = zeros({ height: height });
  var outputGateConnector = multiply(outputGate, inputLayer);
  return target(settings, add(outputGateConnector, output));
};