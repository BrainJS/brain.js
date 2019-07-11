'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RecurrentConnection = require('./layer/recurrent-connection');
var RecurrentInput = require('./layer/recurrent-input');
var RecurrentZeros = require('./layer/recurrent-zeros');
var flattenLayers = require('./utilities/flatten-layers');
var mse2d = require('./utilities/mse-2d');
var FeedForward = require('./feed-forward');
// const Base from './layer/base'

var Recurrent = function (_FeedForward) {
  _inherits(Recurrent, _FeedForward);

  function Recurrent() {
    _classCallCheck(this, Recurrent);

    return _possibleConstructorReturn(this, (Recurrent.__proto__ || Object.getPrototypeOf(Recurrent)).apply(this, arguments));
  }

  _createClass(Recurrent, [{
    key: '_connectLayers',
    value: function _connectLayers() {
      var initialLayers = [];
      var inputLayer = this.inputLayer();
      var hiddenLayers = this._connectHiddenLayers(inputLayer);
      this._outputConnection.setLayer(hiddenLayers[hiddenLayers.length - 1]);
      var outputLayer = this.outputLayer(this._outputConnection, hiddenLayers.length);
      initialLayers.push(inputLayer);
      initialLayers.push.apply(initialLayers, _toConsumableArray(hiddenLayers));
      initialLayers.push(outputLayer);
      var flattenedLayers = flattenLayers(initialLayers);
      this._inputLayers = flattenedLayers.slice(0, flattenedLayers.indexOf(inputLayer) + 1);
      this._hiddenLayers = [flattenedLayers.slice(flattenedLayers.indexOf(inputLayer) + 1, flattenedLayers.indexOf(hiddenLayers[hiddenLayers.length - 1]) + 1)];
      this._outputLayers = flattenedLayers.slice(flattenedLayers.indexOf(hiddenLayers[hiddenLayers.length - 1]) + 1);
      this._outputLayers.unshift();
      this._recurrentIndices = [];
      this._model = [];
      for (var i = 0; i < this._hiddenLayers[0].length; i++) {
        if (Object.getPrototypeOf(this._hiddenLayers[0][i].constructor).name === 'Model') {
          this._model.push(this._hiddenLayers[0][i]);
          this._hiddenLayers[0].splice(i, 1);
        }
      }
      for (var _i = 0; _i < hiddenLayers.length; _i++) {
        this._recurrentIndices.push(this._hiddenLayers[0].indexOf(hiddenLayers[_i]));
      }
    }
  }, {
    key: '_connectHiddenLayers',
    value: function _connectHiddenLayers(previousLayer) {
      var hiddenLayers = [];
      for (var i = 0; i < this.hiddenLayers.length; i++) {
        var recurrentInput = new RecurrentZeros();
        var hiddenLayer = this.hiddenLayers[i](previousLayer, recurrentInput, i);
        previousLayer = hiddenLayer;
        hiddenLayers.push(hiddenLayer);
      }
      return hiddenLayers;
    }
  }, {
    key: '_connectHiddenLayersDeep',
    value: function _connectHiddenLayersDeep() {
      var hiddenLayers = [];
      var previousHiddenLayers = this._hiddenLayers[this._hiddenLayers.length - 1];
      var firstLayer = this._hiddenLayers[0];
      var recurrentIndex = 0;
      for (var i = 0; i < previousHiddenLayers.length; i++) {
        var previousHiddenLayer = previousHiddenLayers[i];
        var layer = null;
        switch (Object.getPrototypeOf(firstLayer[i].constructor).name) {
          case 'Activation':
            {
              var inputLayer = hiddenLayers[previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer)] || previousHiddenLayer.inputLayer;
              layer = new previousHiddenLayer.constructor(inputLayer);
              break;
            }
          case 'Filter':
            {
              var settings = previousHiddenLayer;
              var _inputLayer = hiddenLayers[previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer)] || previousHiddenLayer.inputLayer;
              layer = new previousHiddenLayer.constructor(settings, _inputLayer);
              break;
            }
          case 'Internal':
            {
              switch (previousHiddenLayer.constructor.name) {
                case 'RecurrentConnection':
                  break;
                case 'RecurrentInput':
                case 'RecurrentZeros':
                default:
                  layer = new RecurrentInput();
                  layer.setDimensions(previousHiddenLayer.width, previousHiddenLayer.height);
                  layer.setRecurrentInput(previousHiddenLayers[this._recurrentIndices[recurrentIndex]]);
                  recurrentIndex++;
                  break;
              }
              break;
            }
          case 'Model':
            {
              layer = previousHiddenLayer;
              break;
            }
          case 'Modifier':
            {
              var _inputLayer2 = hiddenLayers[previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer)] || previousHiddenLayer.inputLayer;
              layer = new previousHiddenLayer.constructor(_inputLayer2);
              break;
            }
          case 'Operator':
            {
              var inputLayer1 = hiddenLayers[previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer1)] || previousHiddenLayer.inputLayer1;
              var inputLayer2 = hiddenLayers[previousHiddenLayers.indexOf(previousHiddenLayer.inputLayer2)] || previousHiddenLayer.inputLayer2;
              layer = new previousHiddenLayer.constructor(inputLayer1, inputLayer2);
              break;
            }
          default:
            throw new Error('hidden layer ' + previousHiddenLayer.constructor.name + ' extends unknown hidden layer ' + Object.getPrototypeOf(previousHiddenLayer.constructor).name);
        }

        hiddenLayers[i] = layer;
      }
      this._hiddenLayers.push(hiddenLayers);
      return hiddenLayers;
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      this._previousInputs = [];
      this._outputConnection = new RecurrentConnection();
      this._connectLayers();
      this.initializeLayers(this._model);
      this.initializeLayers(this._inputLayers);
      this.initializeLayers(this._hiddenLayers[0]);
      this.initializeLayers(this._outputLayers);
    }
  }, {
    key: 'initializeDeep',
    value: function initializeDeep() {
      var hiddenLayers = this._connectHiddenLayersDeep();
      for (var i = 0; i < hiddenLayers.length; i++) {
        var hiddenLayer = hiddenLayers[i];
        hiddenLayer.reuseKernels(this._hiddenLayers[0][i]);
      }
    }
  }, {
    key: 'runInput',
    value: function runInput(input) {
      var max = input.length - 1;
      for (var x = 0; x < max; x++) {
        var hiddenLayers = this._hiddenLayers[x];
        var hiddenConnection = hiddenLayers[hiddenLayers.length - 1];
        this._outputConnection.setLayer(hiddenConnection);

        this._inputLayers[0].predict([input[x]]);
        this._previousInputs.push(this._inputLayers[0].weights);
        for (var i = 1; i < this._inputLayers.length; i++) {
          this._inputLayers[i].predict();
        }
        for (var _i2 = 0; _i2 < this._hiddenLayers[x].length; _i2++) {
          this._hiddenLayers[x][_i2].predict();
        }
        for (var _i3 = 0; _i3 < this._outputLayers.length; _i3++) {
          this._outputLayers[_i3].predict();
        }
      }
      return this._outputLayers[this._outputLayers.length - 1].weights;
    }
  }, {
    key: '_prepTraining',
    value: function _prepTraining(data, options) {
      var stats = _get(Recurrent.prototype.__proto__ || Object.getPrototypeOf(Recurrent.prototype), '_prepTraining', this).call(this, data, options);
      this.initializeDeep();
      return stats;
    }
  }, {
    key: '_calculateDeltas',
    value: function _calculateDeltas(target, offset) {
      for (var x = target.length - 1; x >= 0; x--) {
        var hiddenLayersIndex = offset + x;
        var hiddenLayers = this._hiddenLayers[hiddenLayersIndex];
        var hiddenConnection = hiddenLayers[hiddenLayers.length - 1];
        this._outputConnection.setLayer(hiddenConnection);
        if (this._previousInputs.length > 0) {
          this._inputLayers[0].weights = this._previousInputs.pop();
        }

        this._outputLayers[this._outputLayers.length - 1].compare([target[x]]);
        for (var i = this._outputLayers.length - 2; i >= 0; i--) {
          this._outputLayers[i].compare();
        }
        for (var _i4 = hiddenLayers.length - 1; _i4 >= 0; _i4--) {
          hiddenLayers[_i4].compare();
        }
        for (var _i5 = this._inputLayers.length - 1; _i5 >= 1; _i5--) {
          this._inputLayers[_i5].compare();
        }
      }
    }
  }, {
    key: '_adjustWeights',
    value: function _adjustWeights() {
      for (var hiddenLayersIndex = 0; hiddenLayersIndex < this._hiddenLayers.length; hiddenLayersIndex++) {
        var hiddenLayers = this._hiddenLayers[hiddenLayersIndex];
        var hiddenConnection = hiddenLayers[hiddenLayers.length - 1];
        this._outputConnection.setLayer(hiddenConnection);
        for (var i = 0; i < this._inputLayers.length; i++) {
          this._inputLayers[i].learn();
        }

        for (var _i6 = 0; _i6 < hiddenLayers.length; _i6++) {
          hiddenLayers[_i6].learn();
        }

        for (var _i7 = 0; _i7 < this._outputLayers.length; _i7++) {
          this._outputLayers[_i7].learn();
        }

        for (var _i8 = 0; _i8 < this._model.length; _i8++) {
          this._model[_i8].learn();
        }
      }
    }

    /**
     *
     * @param {number[]} input
     * @param {number[]} target
     * @param {Boolean} [logErrorRate]
     */

  }, {
    key: '_trainPattern',
    value: function _trainPattern(input, target, logErrorRate) {
      // forward propagate
      this.runInput(input);

      // back propagate
      this._calculateDeltas(target, input.length - 1);
      this._calculateDeltas(input.slice(1), 0);
      this._adjustWeights();

      if (logErrorRate) {
        var outputLayer = this._outputLayers[this._outputLayers.length - 1];
        return mse2d(outputLayer.errors.hasOwnProperty('toArray') ? outputLayer.errors.toArray() : outputLayer.errors);
      }
      return null;
    }
  }], [{
    key: 'structure',
    get: function get() {
      return {
        /**
         *
         * _inputLayers are a 1 dimensional array of input layers defined once
         * @type Object[]
         * @private
         */
        _inputLayers: null,

        /**
         * _hiddenLayers are a 2 dimensional array of hidden layers defined for each recursion
         * @type Object[][]
         * @private
         */
        _hiddenLayers: null,

        /**
         * _outputLayers are a 1 dimensional array of output layers defined once
         * @type Object[]
         * @private
         */
        _outputLayers: null,
        _outputConnection: null,
        _previousInputs: null,
        _model: null,
        _recurrentIndices: null
      };
    }
  }]);

  return Recurrent;
}(FeedForward);

module.exports = Recurrent;