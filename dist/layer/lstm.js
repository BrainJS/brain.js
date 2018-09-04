'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('./index');

exports.default = function (settings, recurrentInput, input) {
  var height = settings.height;

  var inputGateWeights = (0, _index.random)({ height: height, width: input.height });
  var inputGatePeepholes = (0, _index.random)({ width: height, height: height });
  var inputGateBias = (0, _index.zeros)({ height: height });
  var inputGate = (0, _index.sigmoid)((0, _index.add)((0, _index.add)((0, _index.multiply)(inputGateWeights, input), (0, _index.multiply)(inputGatePeepholes, recurrentInput)), inputGateBias));

  var forgetGateWeights = (0, _index.random)({ height: height, width: input.height });
  var forgetGatePeepholes = (0, _index.random)({ width: height, height: height });
  var forgetGateBias = (0, _index.zeros)({ height: height });
  var forgetGate = (0, _index.sigmoid)((0, _index.add)((0, _index.add)((0, _index.multiply)(forgetGateWeights, input), (0, _index.multiply)(forgetGatePeepholes, recurrentInput)), forgetGateBias));

  var outputGateWeights = (0, _index.random)({ height: height, width: input.height });
  var outputGatePeepholes = (0, _index.random)({ width: height, height: height });
  var outputGateBias = (0, _index.zeros)({ height: height });
  var outputGate = (0, _index.sigmoid)((0, _index.add)((0, _index.add)((0, _index.multiply)(outputGateWeights, input), (0, _index.multiply)(outputGatePeepholes, recurrentInput)), outputGateBias));

  var memoryWeights = (0, _index.random)({ height: height, width: input.height });
  var memoryPeepholes = (0, _index.random)({ width: height, height: height });
  var memoryBias = (0, _index.zeros)({ height: height });
  var memory = (0, _index.tanh)((0, _index.add)((0, _index.add)((0, _index.multiply)(memoryWeights, input), (0, _index.multiply)(memoryPeepholes, recurrentInput)), memoryBias));

  // compute new cell activation
  var retainCell = (0, _index.multiplyElement)(forgetGate, input); // what do we keep from cell
  var writeCell = (0, _index.multiplyElement)(inputGate, memory); // what do we write to cell
  var cell = (0, _index.add)(retainCell, writeCell); // new cell contents

  // compute hidden state as gated, saturated cell activations
  return (0, _index.multiplyElement)(outputGate, (0, _index.tanh)(cell));
};