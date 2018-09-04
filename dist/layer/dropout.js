'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.trainingPredict = trainingPredict;
exports.predict = predict;

var _types = require('./types');

var _kernel = require('../utilities/kernel');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// TODO: implement random in glsl in gpu.js
function trainingPredict(inputs) {
  if (Math.random() < this.constants.probability) {
    return 0;
  }
  return inputs[this.thread.y][this.thread.x];
}

function predict(inputs) {
  return inputs[this.thread.y][this.thread.x] * this.constants.probability;
}

var Dropout = function (_Filter) {
  _inherits(Dropout, _Filter);

  _createClass(Dropout, null, [{
    key: 'defaults',
    get: function get() {
      return {
        width: 0,
        height: 0,
        depth: 0,
        probability: 0.5,
        isTraining: false
      };
    }
  }]);

  function Dropout(settings, inputLayer) {
    _classCallCheck(this, Dropout);

    var _this = _possibleConstructorReturn(this, (Dropout.__proto__ || Object.getPrototypeOf(Dropout)).call(this, settings));

    _this.inputLayer = inputLayer;
    _this.validate();
    return _this;
  }

  _createClass(Dropout, [{
    key: 'setupKernels',
    value: function setupKernels() {
      if (this.isTraining) {
        this.predictKernel = (0, _kernel.makeKernel)(trainingPredict, {
          output: [this.width, this.height, this.depth]
        });
      } else {
        this.predictKernel = (0, _kernel.makeKernel)(predict, {
          output: [this.width, this.height, this.depth]
        });
      }
    }
  }, {
    key: 'predict',
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights);
    }
  }, {
    key: 'compare',
    value: function compare() {
      this.deltas = this.learnKernel(this.deltas);
    }
  }]);

  return Dropout;
}(_types.Filter);

exports.default = Dropout;