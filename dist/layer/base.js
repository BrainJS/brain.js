'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var zeros2D = require('../utilities/zeros-2d');
var zeros3D = require('../utilities/zeros-3d');

var Base = function () {
  _createClass(Base, null, [{
    key: 'defaults',
    get: function get() {
      return {
        width: 1,
        height: 1,
        depth: 1,
        weights: null,
        deltas: null,
        name: null
      };
    }
  }]);

  function Base() {
    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Base);

    // size
    this.width = null;
    this.height = null;

    // what matters :P
    this.deltas = null;
    this.weights = null;

    this.praxis = null;
    if (this.constructor !== Base) {
      Object.assign(this, Base.defaults, settings);
    }
    Object.assign(this, this.constructor.defaults, settings);

    // special settings
    if (settings.hasOwnProperty('praxis')) {
      if (typeof settings.praxis === 'function') {
        this.praxis = settings.praxis(Object.assign({
          height: this.height,
          width: this.width
        }, settings));
      } else {
        this.praxis = settings.praxis;
      }
    }
  }

  /*
  get weights() {
    return this._weights;
  }
   set weights(value) {
    if (value) {
      if (value[0].length !== this.width) {
        throw new Error(`${this.constructor.name}.weights being set with improper value width`);
      }
      if (value.length !== this.height) {
        throw new Error(`${this.constructor.name}.weights being set with improper value height`);
      }
    }
    this._weights = value;
  }
   get deltas() {
    return this._deltas;
  }
   set deltas(value) {
    if (value) {
      if (value[0].length !== this.width) {
        throw new Error(`${this.constructor.name}.deltas being set with improper value width`);
      }
      if (value.length !== this.height) {
        throw new Error(`${this.constructor.name}.deltas being set with improper value height`);
      }
    }
    this._deltas = value;
  } */

  _createClass(Base, [{
    key: 'validate',
    value: function validate() {
      if (Number.isNaN(this.height)) {
        throw new Error(this.constructor.name + ' layer height is not a number');
      }
      if (Number.isNaN(this.width)) {
        throw new Error(this.constructor.name + ' layer width is not a number');
      }
      if (this.height < 1) {
        throw new Error(this.constructor.name + ' layer height is less than 1');
      }
      if (this.width < 1) {
        throw new Error(this.constructor.name + ' layer width is less than 1');
      }
    }
  }, {
    key: 'setupKernels',
    value: function setupKernels() {
      // console.log(`${this.constructor.name}-setupKernels is not yet implemented`)
    }
  }, {
    key: 'reuseKernels',
    value: function reuseKernels(layer) {
      if (layer.width !== this.width) {
        throw new Error(this.constructor.name + ' kernel width mismatch ' + layer.width + ' is not ' + this.width);
      }
      if (layer.height !== this.height) {
        throw new Error(this.constructor.name + ' kernel width mismatch ' + layer.height + ' is not ' + this.height);
      }
      if (layer.hasOwnProperty('predictKernel')) {
        this.predictKernel = layer.predictKernel;
      }
      if (layer.hasOwnProperty('compareKernel')) {
        this.compareKernel = layer.compareKernel;
      }
      this.praxis = layer.praxis;
    }
  }, {
    key: 'predict',
    value: function predict() {}
    // throw new Error(`${this.constructor.name}-predict is not yet implemented`)


    // eslint-disable-next-line

  }, {
    key: 'compare',
    value: function compare() {
      // throw new Error(`${this.constructor.name}-compare is not yet implemented`)
    }
  }, {
    key: 'learn',
    value: function learn(previousLayer, nextLayer, learningRate) {
      this.weights = this.praxis.run(this, previousLayer, nextLayer, learningRate);

      // TODO: put into a kernel
      if (this.depth > 1) {
        this.deltas = zeros3D(this.width, this.height, this.depth);
      } else {
        this.deltas = zeros2D(this.width, this.height);
      }
    }
  }, {
    key: 'toArray',
    value: function toArray() {
      return this.weights.toArray();
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var jsonLayer = {};
      var _constructor = this.constructor,
          defaults = _constructor.defaults,
          name = _constructor.name;

      if (this.constructor !== Base) {
        Object.assign(defaults, Base.defaults, defaults);
      }
      var keys = Object.keys(defaults);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === 'deltas') continue;
        if (key === 'name' && this[key] === null) continue;
        jsonLayer[key] = this[key];
      }
      jsonLayer.type = name;
      return jsonLayer;
    }
  }]);

  return Base;
}();

module.exports = Base;