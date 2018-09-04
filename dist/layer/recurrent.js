'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('.');

exports.default = function (settings, input, recurrentInput) {
  var height = settings.height;


  recurrentInput.setDimensions(1, height);

  // wxh
  var weight = (0, _.random)({ name: 'weight', height: height, width: input.height });
  // whh
  var transition = (0, _.random)({ name: 'transition', height: height, width: height });
  // bhh
  var bias = (0, _.zeros)({ name: 'bias', height: height });

  return (0, _.relu)((0, _.add)((0, _.add)((0, _.multiply)(weight, input), (0, _.multiply)(transition, recurrentInput)), bias));
};