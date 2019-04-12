'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _thaw = require('thaw.js');

var _thaw2 = _interopRequireDefault(_thaw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @param {object} options
 * @constructor
 */
var BaseInterface = function () {
  function BaseInterface() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BaseInterface);

    Object.assign(this, this.constructor.defaults, options);
    this.trainOpts = {};
    this.updateTrainingOptions(Object.assign({}, this.constructor.trainDefaults, options));

    this.inputLookup = null;
    this.inputLookupLength = null;
    this.outputLookup = null;
    this.outputLookupLength = null;
  }

  /**
   *
   * @param options
   *    Supports all `trainDefaults` properties
   *    also supports:
   *       learningRate: (number),
   *       momentum: (number),
   *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
   */


  _createClass(BaseInterface, [{
    key: 'updateTrainingOptions',
    value: function updateTrainingOptions(options) {
      var trainDefaults = this.constructor.trainDefaults;
      for (var p in trainDefaults) {
        if (!trainDefaults.hasOwnProperty(p)) continue;
        this.trainOpts[p] = options.hasOwnProperty(p) ? options[p] : trainDefaults[p];
      }
      this.validateTrainingOptions(this.trainOpts);
      this.setLogMethod(options.log || this.trainOpts.log);
      this.activation = options.activation || this.activation;
    }

    /**
     *
     * @param options
     */

  }, {
    key: 'validateTrainingOptions',
    value: function validateTrainingOptions(options) {
      var validations = {
        iterations: function iterations(val) {
          return typeof val === 'number' && val > 0;
        },
        errorThresh: function errorThresh(val) {
          return typeof val === 'number' && val > 0 && val < 1;
        },
        log: function log(val) {
          return typeof val === 'function' || typeof val === 'boolean';
        },
        logPeriod: function logPeriod(val) {
          return typeof val === 'number' && val > 0;
        },
        learningRate: function learningRate(val) {
          return typeof val === 'number' && val > 0 && val < 1;
        },
        momentum: function momentum(val) {
          return typeof val === 'number' && val > 0 && val < 1;
        },
        callback: function callback(val) {
          return typeof val === 'function' || val === null;
        },
        callbackPeriod: function callbackPeriod(val) {
          return typeof val === 'number' && val > 0;
        },
        timeout: function timeout(val) {
          return typeof val === 'number' && val > 0;
        }
      };
      for (var p in validations) {
        if (!validations.hasOwnProperty(p)) continue;
        if (!options.hasOwnProperty(p)) continue;
        if (!validations[p](options[p])) {
          throw new Error('[' + p + ', ' + options[p] + '] is out of normal training range, your network will probably not train.');
        }
      }
    }

    /**
     *
     * @param log
     * if a method is passed in method is used
     * if false passed in nothing is logged
     * @returns error
     */

  }, {
    key: 'setLogMethod',
    value: function setLogMethod(log) {
      if (typeof log === 'function') {
        this.trainOpts.log = log;
      } else if (log) {
        this.trainOpts.log = console.log;
      } else {
        this.trainOpts.log = false;
      }
    }

    /**
     *
     * @param data
     * @returns {Number} error
     */

  }, {
    key: 'calculateTrainingError',
    value: function calculateTrainingError(data) {
      var sum = 0;
      for (var i = 0; i < data.length; ++i) {
        sum += this.trainPattern(data[i], true);
      }
      return sum / data.length;
    }

    /**
     * @param data
     */

  }, {
    key: 'trainPatterns',
    value: function trainPatterns(data) {
      for (var i = 0; i < data.length; ++i) {
        this.trainPattern(data[i]);
      }
    }

    /**
     *
     * @param {object} data
     * @param {object} status { iterations: number, error: number }
     * @param endTime
     */

  }, {
    key: 'trainingTick',
    value: function trainingTick(data, status, endTime) {
      if (status.iterations >= this.trainOpts.iterations || status.error <= this.trainOpts.errorThresh || Date.now() >= endTime) {
        return false;
      }

      status.iterations++;

      if (this.trainOpts.log && status.iterations % this.trainOpts.logPeriod === 0) {
        status.error = this.calculateTrainingError(data);
        this.trainOpts.log('iterations: ' + status.iterations + ', training error: ' + status.error);
      } else {
        if (status.iterations % this.errorCheckInterval === 0) {
          status.error = this.calculateTrainingError(data);
        } else {
          this.trainPatterns(data);
        }
      }

      if (this.trainOpts.callback && status.iterations % this.trainOpts.callbackPeriod === 0) {
        this.trainOpts.callback({
          iterations: status.iterations,
          error: status.error
        });
      }
      return true;
    }

    /**
     *
     * @param data
     * @param options
     * @protected
     * @return {object} { data, status, endTime }
     */

  }, {
    key: 'prepTraining',
    value: function prepTraining(data, options) {
      this.updateTrainingOptions(options);
      if (this.setupData) data = this.setupData(data);
      if (this.formatData) data = this.formatData(data);
      var endTime = Date.now() + this.trainOpts.timeout;

      var status = {
        error: 1,
        iterations: 0
      };

      this.verifyIsInitialized(data);

      return {
        data: data,
        status: status,
        endTime: endTime
      };
    }

    /**
     *
     * @param data
     * @param options
     * @returns {object} {error: number, iterations: number}
     */

  }, {
    key: 'train',
    value: function train(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var status = void 0,
          endTime = void 0;

      var _prepTraining = this.prepTraining(data, options);

      data = _prepTraining.data;
      status = _prepTraining.status;
      endTime = _prepTraining.endTime;


      while (this.trainingTick(data, status, endTime)) {}
      return status;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {Promise}
     * @resolves {{error: number, iterations: number}}
     * @rejects {{trainError: string, status: {error: number, iterations: number}}
     */

  }, {
    key: 'trainAsync',
    value: function trainAsync(data) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var status = void 0,
          endTime = void 0;

      var _prepTraining2 = this.prepTraining(data, options);

      data = _prepTraining2.data;
      status = _prepTraining2.status;
      endTime = _prepTraining2.endTime;


      return new Promise(function (resolve, reject) {
        try {
          var thawedTrain = new _thaw2.default(new Array(_this.trainOpts.iterations), {
            delay: true,
            each: function each() {
              return _this.trainingTick(data, status, endTime) || thawedTrain.stop();
            },
            done: function done() {
              return resolve(status);
            }
          });
          thawedTrain.tick();
        } catch (trainError) {
          reject({ trainError: trainError, status: status });
        }
      });
    }

    // These methods to be implimented in subclasses

  }, {
    key: 'run',
    value: function run() {
      throw new Error('not yet implemented');
    }
  }, {
    key: 'trainPattern',
    value: function trainPattern() {
      throw new Error('not yet implemented');
    }
  }, {
    key: 'verifyIsInitialized',
    value: function verifyIsInitialized() {
      throw new Error('not yet implemented');
    }
  }, {
    key: 'addFormat',
    value: function addFormat() {
      throw new Error('not yet implemented');
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      throw new Error('not yet implemented');
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON() {
      throw new Error('not yet implemented');
    }
  }, {
    key: 'toFunction',
    value: function toFunction() {
      throw new Error('not yet implemented');
    }
  }]);

  return BaseInterface;
}();

exports.default = BaseInterface;
//# sourceMappingURL=base-interface.js.map