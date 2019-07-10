'use strict';

var _require = require('./index'),
    add = _require.add,
    multiply = _require.multiply,
    multiplyElement = _require.multiplyElement,
    random = _require.random,
    sigmoid = _require.sigmoid,
    tanh = _require.tanh,
    zeros = _require.zeros;

module.exports = function (settings, recurrentInput, input) {
  var height = settings.height;

  var inputGateWeights = random({ height: height, width: input.height });
  var inputGatePeepholes = random({ width: height, height: height });
  var inputGateBias = zeros({ height: height });
  var inputGate = sigmoid(add(add(multiply(inputGateWeights, input), multiply(inputGatePeepholes, recurrentInput)), inputGateBias));

  var forgetGateWeights = random({ height: height, width: input.height });
  var forgetGatePeepholes = random({ width: height, height: height });
  var forgetGateBias = zeros({ height: height });
  var forgetGate = sigmoid(add(add(multiply(forgetGateWeights, input), multiply(forgetGatePeepholes, recurrentInput)), forgetGateBias));

  var outputGateWeights = random({ height: height, width: input.height });
  var outputGatePeepholes = random({ width: height, height: height });
  var outputGateBias = zeros({ height: height });
  var outputGate = sigmoid(add(add(multiply(outputGateWeights, input), multiply(outputGatePeepholes, recurrentInput)), outputGateBias));

  var memoryWeights = random({ height: height, width: input.height });
  var memoryPeepholes = random({ width: height, height: height });
  var memoryBias = zeros({ height: height });
  var memory = tanh(add(add(multiply(memoryWeights, input), multiply(memoryPeepholes, recurrentInput)), memoryBias));

  // compute new cell activation
  var retainCell = multiplyElement(forgetGate, input); // what do we keep from cell
  var writeCell = multiplyElement(inputGate, memory); // what do we write to cell
  var cell = add(retainCell, writeCell); // new cell contents

  // compute hidden state as gated, saturated cell activations
  return multiplyElement(outputGate, tanh(cell));
};