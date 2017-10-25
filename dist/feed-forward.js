'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lookup = require('./lookup');

var _lookup2 = _interopRequireDefault(_lookup);

var _trainStream = require('./train-stream');

var _trainStream2 = _interopRequireDefault(_trainStream);

var _max = require('./utilities/max');

var _max2 = _interopRequireDefault(_max);

var _mse = require('./utilities/mse');

var _mse2 = _interopRequireDefault(_mse);

var _layerFromJson = require('./utilities/layer-from-json');

var _layerFromJson2 = _interopRequireDefault(_layerFromJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 * @param {object} options
 * @constructor
 */
var FeedForward = function () {
  function FeedForward() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, FeedForward);

    Object.assign(this, FeedForward.defaults, options);
    this.layers = null;
  }

  _createClass(FeedForward, [{
    key: 'connectLayers',
    value: function connectLayers() {
      this.layers = [];
      var inputLayer = this.inputLayer(null, this.layers.length);
      this.layers.push(inputLayer);
      var previousLayer = inputLayer;
      for (var i = 0; i < this.hiddenLayers.length; i++) {
        var hiddenLayer = this.hiddenLayers[i](previousLayer, this.layers.length);
        this.layers.push(hiddenLayer);
        previousLayer = hiddenLayer;
      }
      this.layers.push(this.outputLayer(previousLayer, this.layers.length));

      this.connectNestedLayers();
    }
  }, {
    key: 'connectNestedLayers',
    value: function connectNestedLayers() {
      for (var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i];
        if (layer.hasOwnProperty('inputLayer') && this.layers.indexOf(layer.inputLayer) !== -1) continue;
        var nestedLayer = layer;
        while (nestedLayer = nestedLayer.inputLayer) {
          if (this.layers.indexOf(nestedLayer) !== -1) continue;
          this.layers.splice(i, 0, nestedLayer);
        }
      }
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      this.connectLayers();
      for (var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i];
        layer.setupKernels();
      }
    }

    /**
     *
     * @param input
     * @returns {*}
     */

  }, {
    key: 'run',
    value: function run(input) {
      if (this.inputLookup) {
        input = _lookup2.default.toArray(this.inputLookup, input);
      }

      var output = this.runInput(input);

      if (this.outputLookup) {
        output = _lookup2.default.toHash(this.outputLookup, output);
      }
      return output;
    }
  }, {
    key: 'runInput',
    value: function runInput(input) {
      this.layers[0].predict(input);
      for (var i = 1; i < this.layers.length; i++) {
        this.layers[i].predict();
      }
      return this.layers[this.layers.length - 1].outputs;
    }
  }, {
    key: 'calculateDeltas',
    value: function calculateDeltas() {
      for (var i = this.layers.length - 1; i > -1; i--) {
        var previousLayer = this.layers[i - 1];
        var nextLayer = this.layers[i + 1];
        this.layers[i].compare(previousLayer, nextLayer);
      }
    }

    /**
     *
     * @param data
     * @param _options
     * @returns {{error: number, iterations: number}}
     */

  }, {
    key: 'train',
    value: function train(data) {
      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var options = Object.assign({}, FeedForward.trainDefaults, _options);
      data = this.formatData(data);
      var iterations = options.iterations;
      var errorThresh = options.errorThresh;
      var log = options.log === true ? console.log : options.log;
      var logPeriod = options.logPeriod;
      var learningRate = _options.learningRate || this.learningRate || options.learningRate;
      var callback = options.callback;
      var callbackPeriod = options.callbackPeriod;
      if (!options.reinforce) {
        this.initialize();
      }

      var error = 1;
      var i = void 0;
      for (i = 0; i < iterations && error > errorThresh; i++) {
        var sum = 0;
        for (var j = 0; j < data.length; j++) {
          var err = this.trainPattern(data[j].input, data[j].output, learningRate);
          sum += err;
        }
        error = sum / data.length;

        if (log && i % logPeriod === 0) {
          log('iterations:', i, 'training error:', error);
        }
        if (callback && i % callbackPeriod === 0) {
          callback({ error: error, iterations: i });
        }
      }

      return {
        error: error,
        iterations: i
      };
    }

    /**
     *
     * @param input
     * @param target
     * @param learningRate
     */

  }, {
    key: 'trainPattern',
    value: function trainPattern(input, target, learningRate) {
      learningRate = learningRate || this.learningRate;

      // forward propagate
      this.runInput(input);

      // back propagate
      this.calculateDeltas(target);
      this.adjustWeights(learningRate);

      var error = (0, _mse2.default)(this.outputLayer.errors.toArray());
      return error;
    }

    /**
     *
     * @param learningRate
     */

  }, {
    key: 'adjustWeights',
    value: function adjustWeights(learningRate) {
      for (var i = 0; i < this.layers.length; i++) {
        this.layers[i].learn(learningRate);
      }
    }

    /**
     *
     * @param data
     * @returns {*}
     */

  }, {
    key: 'formatData',
    value: function formatData(data) {
      var _this = this;

      if (data.constructor !== Array) {
        // turn stream datum into array
        var tmp = [];
        tmp.push(data);
        data = tmp;
      }
      // turn sparse hash input into arrays with 0s as filler
      var datum = data[0].input;
      if (datum.constructor !== Array && !(datum instanceof Float64Array)) {
        if (!this.inputLookup) {
          this.inputLookup = _lookup2.default.buildLookup(data.map(function (value) {
            return value['input'];
          }));
        }
        data = data.map(function (datum) {
          var array = _lookup2.default.toArray(_this.inputLookup, datum.input);
          return Object.assign({}, datum, { input: array });
        }, this);
      }

      if (data[0].output.constructor !== Array) {
        if (!this.outputLookup) {
          this.outputLookup = _lookup2.default.buildLookup(data.map(function (value) {
            return value['output'];
          }));
        }
        data = data.map(function (datum) {
          var array = _lookup2.default.toArray(_this.outputLookup, datum.output);
          return Object.assign({}, datum, { output: array });
        }, this);
      }
      return data;
    }

    /**
     *
     * @param data
     * @returns {
     *  {
     *    error: number,
     *    misclasses: Array
     *  }
     * }
     */

  }, {
    key: 'test',
    value: function test(data) {
      var _this2 = this;

      data = this.formatData(data);

      // for binary classification problems with one output node
      var isBinary = data[0].output.length === 1;
      var falsePos = 0;
      var falseNeg = 0;
      var truePos = 0;
      var trueNeg = 0;

      // for classification problems
      var misclasses = [];

      // run each pattern through the trained network and collect
      // error and misclassification statistics
      var sum = 0;

      var _loop = function _loop(i) {
        var output = _this2.runInput(data[i].input);
        var target = data[i].output;

        var actual = void 0,
            expected = void 0;
        if (isBinary) {
          actual = output[0] > _this2.binaryThresh ? 1 : 0;
          expected = target[0];
        } else {
          actual = output.indexOf((0, _max2.default)(output));
          expected = target.indexOf((0, _max2.default)(target));
        }

        if (actual !== expected) {
          var misclass = data[i];
          Object.assign(misclass, {
            actual: actual,
            expected: expected
          });
          misclasses.push(misclass);
        }

        if (isBinary) {
          if (actual === 0 && expected === 0) {
            trueNeg++;
          } else if (actual === 1 && expected === 1) {
            truePos++;
          } else if (actual === 0 && expected === 1) {
            falseNeg++;
          } else if (actual === 1 && expected === 0) {
            falsePos++;
          }
        }

        var errors = output.map(function (value, i) {
          return target[i] - value;
        });
        sum += (0, _mse2.default)(errors);
      };

      for (var i = 0; i < data.length; i++) {
        _loop(i);
      }
      var error = sum / data.length;

      var stats = {
        error: error,
        misclasses: misclasses
      };

      if (isBinary) {
        Object.assign(stats, {
          trueNeg: trueNeg,
          truePos: truePos,
          falseNeg: falseNeg,
          falsePos: falsePos,
          total: data.length,
          precision: truePos / (truePos + falsePos),
          recall: truePos / (truePos + falseNeg),
          accuracy: (trueNeg + truePos) / data.length
        });
      }
      return stats;
    }

    /**
     *
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this3 = this;

      var jsonLayers = [];
      for (var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i];
        var jsonLayer = {};
        var jsonKeys = Object.keys(layer.constructor.defaults);
        for (var keyIndex = 0; keyIndex < jsonKeys.length; keyIndex++) {
          var key = jsonKeys[keyIndex];
          jsonLayer[key] = layer[key];
        }
        jsonLayer.type = layer.constructor.name;
        if (layer.inputLayer) {
          jsonLayer.inputLayerIndex = this.layers.indexOf(layer.inputLayer);
        } else if (layer.inputLayers) {
          jsonLayer.inputLayerIndexes = layer.inputLayers.map(function (inputLayer) {
            return _this3.layers.indexOf(inputLayer);
          });
        }
        jsonLayers.push(jsonLayer);
      }
      var json = {
        layers: jsonLayers
      };
      return json;
    }

    /**
     *
     * @param json
     * @param [getLayer]
     * @returns {FeedForward}
     */

  }, {
    key: 'toFunction',


    /**
     *
     * @returns {Function}
     */
    value: function toFunction() {
      throw new Error('not yet implemented');
    }

    /**
     * This will create a TrainStream (WriteStream) for us to send the training data to.
     * @param opts training options
     * @returns {TrainStream|*}
     */

  }, {
    key: 'createTrainStream',
    value: function createTrainStream(opts) {
      throw new Error('not yet implemented');
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(json, getLayer) {
      var jsonLayers = json.layers;
      var layers = [];
      var inputLayer = (0, _layerFromJson2.default)(jsonLayers[0]) || getLayer(jsonLayers[0]);
      layers.push(inputLayer);
      for (var i = 1; i < jsonLayers.length; i++) {
        var jsonLayer = jsonLayers[i];
        if (jsonLayer.hasOwnProperty('inputLayerIndex')) {
          var _inputLayer = layers[jsonLayer.inputLayerIndex];
          layers.push((0, _layerFromJson2.default)(jsonLayer, _inputLayer) || getLayer(jsonLayer, _inputLayer));
        } else if (jsonLayer.hasOwnProperty('inputLayerIndexes')) {
          var inputLayers = jsonLayer.inputLayerIndexes.map(function (inputLayerIndex) {
            return layers[inputLayerIndex];
          });
          layers.push((0, _layerFromJson2.default)(jsonLayer, inputLayers) || getLayer(jsonLayer, inputLayers));
        }
      }

      var net = new FeedForward(json);
      net.layers = layers;
      return net;
    }
  }]);

  return FeedForward;
}();

exports.default = FeedForward;


FeedForward.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callback: null,
  callbackPeriod: 10,
  reinforce: false
};

FeedForward.defaults = {
  learningRate: 0.3,
  momentum: 0.1,
  binaryThresh: 0.5,
  hiddenLayers: null,
  inputLayer: null,
  outputLayer: null
};
//# sourceMappingURL=feed-forward.js.map