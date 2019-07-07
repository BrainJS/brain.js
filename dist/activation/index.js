'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _leakyRelu = require('./leaky-relu');

var leakyRelu = _interopRequireWildcard(_leakyRelu);

var _relu = require('./relu');

var relu = _interopRequireWildcard(_relu);

var _sigmoid = require('./sigmoid');

var sigmoid = _interopRequireWildcard(_sigmoid);

var _tanh = require('./tanh');

var tanh = _interopRequireWildcard(_tanh);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = { leakyRelu: leakyRelu, relu: relu, sigmoid: sigmoid, tanh: tanh };