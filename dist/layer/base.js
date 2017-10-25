'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Base = function () {
  _createClass(Base, null, [{
    key: 'defaults',
    get: function get() {
      return {
        width: 1,
        height: 1,
        depth: 1,
        outputs: null,
        errors: null,
        deltas: null,
        weights: null,
        changes: null
      };
    }
  }]);

  function Base() {
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Base);

    //layers
    this.inputLayer = null;
    this.inputLayers = null;

    //size
    this.width = null;
    this.height = null;
    this.depth = null;

    //methods
    this.predictKernel = null;
    this.compareKernel = null;
    this.learnKernel = null;

    //what matters :P
    this.outputs = null;
    this.errors = null;
    this.deltas = null;
    this.weights = null;
    this.changes = null;

    var defaults = this.constructor.defaults;
    for (var p in defaults) {
      if (!defaults.hasOwnProperty(p)) continue;
      this[p] = settings.hasOwnProperty(p) ? settings[p] : defaults[p];
    }
  }

  _createClass(Base, [{
    key: 'setupKernels',
    value: function setupKernels() {
      throw new Error('setupKernels not implemented on BaseLayer');
    }
  }, {
    key: 'predict',
    value: function predict() {
      throw new Error('predict not implemented on BaseLayer');
    }
  }, {
    key: 'compare',
    value: function compare(previousLayer, nextLayer) {
      throw new Error('compare not implemented on BaseLayer');
    }
  }, {
    key: 'learn',
    value: function learn() {
      throw new Error('learn not implemented on BaseLayer');
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return this.outputs.toArray();
    }
  }]);

  return Base;
}();

exports.default = Base;
//# sourceMappingURL=base.js.map