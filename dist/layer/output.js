'use strict';

var _require = require('.'),
    add = _require.add,
    multiply = _require.multiply,
    random = _require.random,
    target = _require.target,
    zeros = _require.zeros;

module.exports = function (settings, inputLayer) {
  var height = settings.height;

  var outputGate = random({ height: height, width: inputLayer.height });
  var output = zeros({ height: height });
  var outputGateConnector = multiply(outputGate, inputLayer);
  return target(settings, add(outputGateConnector, output));
};