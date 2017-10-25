'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _multiply = require('./multiply');

var _sigmoid = require('../activation/sigmoid');

var _makeKernel = require('../utilities/make-kernel');

var _makeKernel2 = _interopRequireDefault(_makeKernel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sigmoid = function (_Base) {
  _inherits(Sigmoid, _Base);

  function Sigmoid() {
    _classCallCheck(this, Sigmoid);

    return _possibleConstructorReturn(this, (Sigmoid.__proto__ || Object.getPrototypeOf(Sigmoid)).apply(this, arguments));
  }

  _createClass(Sigmoid, [{
    key: 'setupKernels',
    value: function setupKernels() {
      this.predictKernel = (0, _makeKernel2.default)(predict, {
        output: [this.width, this.height, this.depth],
        functions: [_sigmoid.sigmoid]
      });

      this.compareKernel = (0, _makeKernel2.default)(compare, {
        output: [this.width, this.height, this.depth],
        map: {
          errors: calcError,
          deltas: calcDeltas
        }
      });

      this.learnKernel = (0, _makeKernel2.default)(learn, {
        output: [this.width, this.height, this.depth],
        map: {
          weights: calcWeights,
          changes: calcChanges
        }
      });
    }
  }, {
    key: 'predict',
    value: function predict(inputs, x) {
      this.outputs = this.predictKernel(inputs, x, this.weights, this.biases);
    }
  }, {
    key: 'compare',
    value: function compare() {
      var output = this.compareKernel(this.outputs, this.nextLayer.weights, this.nextLayer.deltas);
      this.errors = output.errors;
      this.deltas = output.deltas;
    }
  }, {
    key: 'learn',
    value: function learn() {
      var output = this.learnKernel(this.deltas, this.weights, this.previousLayer.outputs, this.previousLayer.changes, learningRate, momentum);
      this.weights = output.weights;
      this.changes = output.changes;
    }
  }]);

  return Sigmoid;
}(_base2.default);

exports.default = Sigmoid;


function predict(inputs, x, weights, biases) {
  var sum = biases[x];
  for (var k = 0; k < this.output.y; k++) {
    sum += weights[x][k] * inputs[k];
  }
  return (0, _sigmoid.sigmoid)(sum);
}

function compare(outputs, nextLayerWeights, nextLayerDeltas) {
  var output = outputs[this.thread.x];
  return (0, _sigmoid.sigmoidDerivative)(output, calcError(nextLayerWeights, nextLayerDeltas));
}

function calcError(nextWeights, nextDeltas) {
  var error = 0;
  for (var k = 0; k < this.output.x; k++) {
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }
  return error;
}

function learn(deltas, weights, previousLayerOutputs, previousLayerChanges, learningRate, momentum) {
  var delta = deltas[this.thread.y];
  var change = calcChanges(previousLayerChanges, delta, previousLayerOutputs, learningRate, momentum);

  return calcWeights(change, weights);
}

function calcChanges(previousChanges, delta, previousOutputs, learningRate, momentum) {
  var sum = 0;
  for (var i = 0; i < this.output.x; i++) {
    sum += learningRate * delta * previousOutputs[this.thread.x] + momentum * previousChanges[this.thread.y][i];
  }
  return sum;
}

function calcWeights(change, weights) {
  return change + weights[this.thread.y][this.thread.x];
}
//# sourceMappingURL=multiply-sigmoid.js.map