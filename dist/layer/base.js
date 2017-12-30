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
        weights: null,
        errors: null,
        deltas: null,
        changes: null
      };
    }
  }]);

  function Base() {
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Base);

    //size
    this.width = null;
    this.height = null;
    this.depth = null;

    //methods
    this.predictKernel = null;
    this.compareKernel = null;
    this.learnKernel = null;

    //what matters :P
    this.errors = null;
    this.deltas = null;
    this.weights = null;

    this.praxis = null;
    Object.assign(this, this.constructor.defaults, settings);

    // special settings
    if (settings.hasOwnProperty('praxis')) {
      this.praxis = settings.praxis(this);
    }
  }

  _createClass(Base, [{
    key: 'validate',
    value: function validate() {}
  }, {
    key: 'setupKernels',
    value: function setupKernels() {}
  }, {
    key: 'predict',
    value: function predict() {}
  }, {
    key: 'compare',
    value: function compare(previousLayer, nextLayer) {}
  }, {
    key: 'learn',
    value: function learn() {
      this.weights = this.praxis.run(this.weights, this.deltas);
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return this.weights.toArray();
    }
  }]);

  return Base;
}();

exports.default = Base;
//# sourceMappingURL=base.js.map