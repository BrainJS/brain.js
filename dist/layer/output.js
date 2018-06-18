'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('./index');

exports.default = function (settings, inputLayer) {
  var height = settings.height;

  var outputGate = (0, _index.random)({ height: height, width: inputLayer.height });
  var output = (0, _index.zeros)({ height: height });
  var outputGateConnector = (0, _index.multiply)(outputGate, inputLayer);
  return (0, _index.target)(settings, (0, _index.add)(outputGateConnector, output));
};
//# sourceMappingURL=output.js.map