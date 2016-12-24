'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('stream');

var _lookup = require('./lookup');

var _lookup2 = _interopRequireDefault(_lookup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 *
 * @param opts
 * @returns {TrainStream}
 * @constructor
 */
var TrainStream = function (_Writable) {
  _inherits(TrainStream, _Writable);

  function TrainStream(opts) {
    var _ret;

    _classCallCheck(this, TrainStream);

    var _this = _possibleConstructorReturn(this, (TrainStream.__proto__ || Object.getPrototypeOf(TrainStream)).call(this, {
      objectMode: true
    }));

    opts = opts || {};

    // require the neuralNetwork
    if (!opts.neuralNetwork) {
      throw new Error('no neural network specified');
    }

    _this.neuralNetwork = opts.neuralNetwork;
    _this.dataFormatDetermined = false;

    _this.inputKeys = [];
    _this.outputKeys = []; // keeps track of keys seen
    _this.i = 0; // keep track of the for loop i variable that we got rid of
    _this.iterations = opts.iterations || 20000;
    _this.errorThresh = opts.errorThresh || 0.005;
    _this.log = opts.log ? typeof opts.log === 'function' ? opts.log : console.log : false;
    _this.logPeriod = opts.logPeriod || 10;
    _this.callback = opts.callback;
    _this.callbackPeriod = opts.callbackPeriod || 10;
    _this.floodCallback = opts.floodCallback;
    _this.doneTrainingCallback = opts.doneTrainingCallback;

    _this.size = 0;
    _this.count = 0;

    _this.sum = 0;

    _this.on('finish', _this.finishStreamIteration.bind(_this));

    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  /**
   * _write expects data to be in the form of a datum. ie. {input: {a: 1 b: 0}, output: {z: 0}}
   * @param chunk
   * @param enc
   * @param next
   * @returns {*}
   * @private
   */


  _createClass(TrainStream, [{
    key: '_write',
    value: function _write(chunk, enc, next) {
      if (!chunk) {
        // check for the end of one iteration of the stream
        this.emit('finish');
        return next();
      }

      if (!this.dataFormatDetermined) {
        this.size++;
        this.inputKeys = uniques(this.inputKeys.slice(0).concat(Object.keys(chunk.input)));
        this.outputKeys = uniques(this.outputKeys.slice(0).concat(Object.keys(chunk.output)));
        this.firstDatum = this.firstDatum || chunk;
        return next();
      }

      this.count++;

      var data = this.neuralNetwork.formatData(chunk);
      this.trainDatum(data[0]);

      // tell the Readable Stream that we are ready for more data
      next();
    }

    /**
     *
     * @param datum
     */

  }, {
    key: 'trainDatum',
    value: function trainDatum(datum) {
      var err = this.neuralNetwork.trainPattern(datum.input, datum.output);
      this.sum += err;
    }

    /**
     *
     * @returns {*}
     */

  }, {
    key: 'finishStreamIteration',
    value: function finishStreamIteration() {
      var _this2 = this;

      if (this.dataFormatDetermined && this.size !== this.count) {
        this.log('This iteration\'s data length was different from the first.');
      }

      if (!this.dataFormatDetermined) {
        var _ret2 = function () {
          // create the lookup
          _this2.neuralNetwork.inputLookup = _lookup2.default.lookupFromArray(_this2.inputKeys);
          if (_this2.firstDatum.output.constructor !== Array) {
            _this2.neuralNetwork.outputLookup = _lookup2.default.lookupFromArray(_this2.outputKeys);
          }

          var data = _this2.neuralNetwork.formatData(_this2.firstDatum);
          var sizes = [];
          var inputSize = data[0].input.length;
          var outputSize = data[0].output.length;
          var hiddenSizes = _this2.hiddenSizes;
          if (!hiddenSizes) {
            sizes.push(Math.max(3, Math.floor(inputSize / 2)));
          } else {
            hiddenSizes.forEach(function (size) {
              sizes.push(size);
            });
          }

          sizes.unshift(inputSize);
          sizes.push(outputSize);

          _this2.dataFormatDetermined = true;
          _this2.neuralNetwork.initialize(sizes);

          if (typeof _this2.floodCallback === 'function') {
            _this2.floodCallback();
          }
          return {
            v: void 0
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      }

      var error = this.sum / this.size;

      if (this.log && this.i % this.logPeriod == 0) {
        this.log('iterations:', this.i, 'training error:', error);
      }
      if (this.callback && this.i % this.callbackPeriod == 0) {
        this.callback({
          error: error,
          iterations: this.i
        });
      }

      this.sum = 0;
      this.count = 0;
      // update the iterations
      this.i++;

      // do a check here to see if we need the stream again
      if (this.i < this.iterations && error > this.errorThresh) {
        if (typeof this.floodCallback === 'function') {
          return this.floodCallback();
        }
      } else {
        // done training
        if (typeof this.doneTrainingCallback === 'function') {
          return this.doneTrainingCallback({
            error: error,
            iterations: this.i
          });
        }
      }
    }
  }]);

  return TrainStream;
}(_stream.Writable);

/**
 *
 * http://stackoverflow.com/a/21445415/1324039
 * @param arr
 * @returns {Array}
 */


exports.default = TrainStream;
function uniques(arr) {
  var a = [];
  for (var i = 0, l = arr.length; i < l; i++) {
    if (a.indexOf(arr[i]) === -1 && arr[i] !== '') {
      a.push(arr[i]);
    }
  }
  return a;
}
//# sourceMappingURL=train-stream.js.map