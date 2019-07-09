'use strict';

var layer = require('.');
var add = layer.add,
    negative = layer.negative,
    multiply = layer.multiply,
    multiplyElement = layer.multiplyElement,
    ones = layer.ones,
    sigmoid = layer.sigmoid,
    random = layer.random,
    tanh = layer.tanh,
    zeros = layer.zeros;


module.exports = function (settings, recurrentInput, input) {
  var height = settings.height;

  var updateGateWeights = random({ height: height, width: input.height });
  var updateGatePeepholes = random({ width: height, height: height });
  var updateGateBias = zeros({ height: height });
  var updateGate = sigmoid(add(add(multiply(updateGateWeights, input), multiply(updateGatePeepholes, recurrentInput)), updateGateBias));

  var resetGateWeights = random({ height: height, width: input.height });
  var resetGatePeepholes = random({ width: height, height: height });
  var resetGateBias = zeros({ height: height });
  var resetGate = sigmoid(add(add(multiply(resetGateWeights, input), multiply(resetGatePeepholes, recurrentInput)), resetGateBias));

  var cellWeights = random({ height: height, width: input.height });
  var cellPeepholes = random({ width: height, height: height });
  var cellBias = zeros({ height: height });
  var cell = tanh(add(add(multiply(cellWeights, input), multiply(cellPeepholes, multiplyElement(resetGate, recurrentInput))), cellBias));

  // compute hidden state as gated, saturated cell activations
  // negate updateGate
  return add(multiplyElement(add(ones(updateGate.rows, updateGate.columns), negative(updateGate)), cell), multiplyElement(recurrentInput, updateGate));
};