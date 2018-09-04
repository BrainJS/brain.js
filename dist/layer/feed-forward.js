'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = feedForward;

var _index = require('./index');

function feedForward(settings, input) {
  var height = settings.height;

  var weights = (0, _index.random)({ name: 'weights', height: height, width: input.height });
  var biases = (0, _index.random)({ name: 'biases', height: height });

  return (0, _index.sigmoid)((0, _index.add)((0, _index.multiply)(weights, input), biases));
}