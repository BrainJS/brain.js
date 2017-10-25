'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (fn, settings) {
  if (gpuInstance === null) {
    setup(new _gpu2.default());
  }
  if (settings.hasOwnProperty('map')) {
    return gpuInstance.createKernelMap(settings.map, fn, settings).setOutputToTexture(true);
  } else {
    return gpuInstance.createKernel(fn, settings).setOutputToTexture(true);
  }
};

exports.setup = setup;

var _gpu = require('gpu.js');

var _gpu2 = _interopRequireDefault(_gpu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gpuInstance = null;

;

function setup(value) {
  gpuInstance = value;
}
//# sourceMappingURL=make-kernel.js.map