'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = feedForward;

var _ = require('./');

function feedForward(settings, input) {
  var width = settings.width;


  var weights = (0, _.random)({ width: width, height: input.width + 0 });
  var bias = (0, _.random)({ width: width });

  return (0, _.sigmoid)((0, _.add)((0, _.weigh)(input, weights), bias));
}
//# sourceMappingURL=feed-forward.js.map