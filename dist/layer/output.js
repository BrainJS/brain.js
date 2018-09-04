'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('.');

exports.default = function (settings, inputLayer) {
  var height = settings.height;

  var outputGate = (0, _.random)({ height: height, width: inputLayer.height });
  var output = (0, _.zeros)({ height: height });
  var outputGateConnector = (0, _.multiply)(outputGate, inputLayer);
  return (0, _.target)(settings, (0, _.add)(outputGateConnector, output));
};