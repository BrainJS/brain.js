'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('stream');

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

  function TrainStream(options) {
    _classCallCheck(this, TrainStream);

    var _this = _possibleConstructorReturn(this, (TrainStream.__proto__ || Object.getPrototypeOf(TrainStream)).call(this, {
      objectMode: true
    }));

    options = options || {};

    // require the neuralNetwork
    if (!options.neuralNetwork) {
      throw new Error('no neural network specified');
    }

    var _options = options,
        neuralNetwork = _options.neuralNetwork;

    _this.neuralNetwork = neuralNetwork;
    _this.dataFormatDetermined = false;
    _this.i = 0; // keep track of internal iterations
    _this.size = 0;
    _this.count = 0;
    _this.sum = 0;
    _this.floodCallback = options.floodCallback;
    _this.doneTrainingCallback = options.doneTrainingCallback;

    // inherit trainOpts settings from neuralNetwork
    neuralNetwork.updateTrainingOptions(options);
    var trainOpts = neuralNetwork.trainOpts;

    _this.iterations = trainOpts.iterations;
    _this.errorThresh = trainOpts.errorThresh;
    _this.log = trainOpts.log;
    _this.logPeriod = trainOpts.logPeriod;
    _this.callbackPeriod = trainOpts.callbackPeriod;
    _this.callback = trainOpts.callback;

    _this.on('finish', _this.finishStreamIteration.bind(_this));
    return _this;
  }

  _createClass(TrainStream, [{
    key: 'endInputs',
    value: function endInputs() {
      this.write(false);
    }

    /**
     * _write expects data to be in the form of a datum. ie. {input: {a: 1 b: 0}, output: {z: 0}}
     * @param chunk
     * @param enc
     * @param next
     * @returns {*}
     * @private
     */

  }, {
    key: '_write',
    value: function _write(chunk, enc, next) {
      if (!chunk) {
        // check for the end of one iteration of the stream
        this.emit('finish');
        return next();
      }

      if (!this.dataFormatDetermined) {
        this.size++;
        this.neuralNetwork.addFormat(chunk);
        this.firstDatum = this.firstDatum || chunk;
        return next();
      }

      this.count++;

      var data = this.neuralNetwork.formatData(chunk);
      this.sum += this.neuralNetwork.trainPattern(data[0], true);

      // tell the Readable Stream that we are ready for more data
      next();
    }

    /**
     *
     * @returns {*}
     */

  }, {
    key: 'finishStreamIteration',
    value: function finishStreamIteration() {
      if (this.dataFormatDetermined && this.size !== this.count) {
        this.log('This iteration\'s data length was different from the first.');
      }

      if (!this.dataFormatDetermined) {
        var data = this.neuralNetwork.formatData(this.firstDatum);
        this.neuralNetwork.verifyIsInitialized(data);
        this.dataFormatDetermined = true;

        if (typeof this.floodCallback === 'function') {
          this.floodCallback();
        }
        return;
      }

      var error = this.sum / this.size;

      if (this.log && this.i % this.logPeriod === 0) {
        this.log('iterations: ' + this.i + ', training error: ' + error);
      }
      if (this.callback && this.i % this.callbackPeriod === 0) {
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

exports.default = TrainStream;
//# sourceMappingURL=train-stream.js.map