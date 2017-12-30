'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('./');

exports.default = function (settings, recurrentInput, input) {
  //wxh
  var weight = new Random(hiddenSize, prevSize, 0.08);
  //whh
  var transition = new Random(hiddenSize, hiddenSize, 0.08);
  //bhh
  var bias = new Zeros(hiddenSize, 1);

  return (0, _.relu)((0, _.add)((0, _.add)((0, _.multiply)(weight, input), (0, _.multiply)(transition, recurrentInput)), bias));
};
//# sourceMappingURL=recurrent.js.map