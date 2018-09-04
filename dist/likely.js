"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = likely;
/**
 *
 * @param {*} input
 * @param {NeuralNetwork} net
 * @returns {*}
 */
function likely(input, net) {
  var output = net.run(input);
  var maxProp = null;
  var maxValue = -1;

  Object.keys(output).forEach(function (key) {
    var value = output[key];
    if (value > maxValue) {
      maxProp = key;
      maxValue = value;
    }
  });

  return maxProp;
}