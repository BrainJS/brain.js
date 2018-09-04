'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('.');

exports.default = function (settings, recurrentInput, input) {
  var height = settings.height;

  var updateGateWeights = (0, _.random)({ height: height, width: input.height });
  var updateGatePeepholes = (0, _.random)({ width: height, height: height });
  var updateGateBias = (0, _.zeros)({ height: height });
  var updateGate = (0, _.sigmoid)((0, _.add)((0, _.add)((0, _.multiply)(updateGateWeights, input), (0, _.multiply)(updateGatePeepholes, recurrentInput)), updateGateBias));

  var resetGateWeights = (0, _.random)({ height: height, width: input.height });
  var resetGatePeepholes = (0, _.random)({ width: height, height: height });
  var resetGateBias = (0, _.zeros)({ height: height });
  var resetGate = (0, _.sigmoid)((0, _.add)((0, _.add)((0, _.multiply)(resetGateWeights, input), (0, _.multiply)(resetGatePeepholes, recurrentInput)), resetGateBias));

  var cellWeights = (0, _.random)({ height: height, width: input.height });
  var cellPeepholes = (0, _.random)({ width: height, height: height });
  var cellBias = (0, _.zeros)({ height: height });
  var cell = (0, _.tanh)((0, _.add)((0, _.add)((0, _.multiply)(cellWeights, input), (0, _.multiply)(cellPeepholes, (0, _.multiplyElement)(resetGate, recurrentInput))), cellBias));

  // compute hidden state as gated, saturated cell activations
  // negate updateGate
  return (0, _.add)((0, _.multiplyElement)((0, _.add)((0, _.ones)(updateGate.rows, updateGate.columns), (0, _.negative)(updateGate)), cell), (0, _.multiplyElement)(recurrentInput, updateGate));
};