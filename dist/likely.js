"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = likely;
/**
 *
 * @param {*} input
 * @param {brain.NeuralNetwork} net
 * @returns {*}
 */
function likely(input, net) {
  var output = net.run(input);
  var maxProp = null;
  var maxValue = -1;
  for (var prop in output) {
    var value = output[prop];
    if (value > maxValue) {
      maxProp = prop;
      maxValue = value;
    }
  }
  return maxProp;
}
//# sourceMappingURL=likely.js.map