'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CrossValidate = function () {

  /**
   *
   * @param {NeuralNetwork|constructor} Classifier
   * @param {object} [options]
   */
  function CrossValidate(Classifier, options) {
    _classCallCheck(this, CrossValidate);

    this.Classifier = Classifier;
    this.options = options;
    this.json = null;
  }

  /**
   *
   * @param {object} trainOpts
   * @param {object} trainSet
   * @param {object} testSet
   * @returns {void|*}
   */


  _createClass(CrossValidate, [{
    key: 'testPartition',
    value: function testPartition(trainOpts, trainSet, testSet) {
      var classifier = new this.Classifier(this.options);
      var beginTrain = Date.now();
      var trainingStats = classifier.train(trainSet, trainOpts);
      var beginTest = Date.now();
      var testStats = classifier.test(testSet);
      var endTest = Date.now();
      var stats = Object.assign({}, testStats, {
        trainTime: beginTest - beginTrain,
        testTime: endTest - beginTest,
        iterations: trainingStats.iterations,
        error: trainingStats.error,
        total: testStats.total,
        learningRate: classifier.trainOpts.learningRate,
        hiddenLayers: classifier.hiddenLayers,
        network: classifier.toJSON()
      });

      return stats;
    }

    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     * source: http://stackoverflow.com/a/12646864/1324039
     */

  }, {
    key: 'shuffleArray',
    value: function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    }

    /**
     *
     * @param {object} data
     * @param {object} trainOpts
     * @param {number} [k]
     * @returns {
     *  {
     *    avgs: {
     *      error: number,
     *      trainTime: number,
     *      testTime: number,
     *      iterations: number,
     *      error: number
     *    },
     *    stats: {
     *      truePos: number,
     *      trueNeg: number,
     *      falsePos: number,
     *      falseNeg: number,
     *      total: number
     *    },
     *    sets: Array
     *  }
     * }
     */

  }, {
    key: 'train',
    value: function train(data) {
      var trainOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var k = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;

      if (data.length < k) {
        throw new Error('Training set size is too small for ' + data.length + ' k folds of ' + k);
      }

      var size = data.length / k;

      if (data.constructor === Array) {
        this.shuffleArray(data);
      } else {
        var newData = {};
        this.shuffleArray(Object.keys(data)).forEach(function (key) {
          newData[key] = data[key];
        });
        data = newData;
      }

      var avgs = {
        trainTime: 0,
        testTime: 0,
        iterations: 0,
        error: 0
      };

      var stats = {
        total: 0
      };

      var binaryStats = {
        total: 0,
        truePos: 0,
        trueNeg: 0,
        falsePos: 0,
        falseNeg: 0
      };

      var results = [];
      var stat = void 0;
      var isBinary = null;

      for (var i = 0; i < k; i++) {
        var dclone = data.slice(0);
        var testSet = dclone.splice(i * size, size);
        var trainSet = dclone;
        var result = this.testPartition(trainOpts, trainSet, testSet);

        if (isBinary === null) {
          isBinary = result.hasOwnProperty('falseNeg') && result.hasOwnProperty('falsePos') && result.hasOwnProperty('trueNeg') && result.hasOwnProperty('truePos');
          if (isBinary) {
            Object.assign(stats, binaryStats);
          }
        }

        for (stat in avgs) {
          if (stat in avgs) {
            avgs[stat] += result[stat];
          }
        }

        for (stat in stats) {
          if (stat in stats) {
            stats[stat] += result[stat];
          }
        }

        results.push(result);
      }

      for (stat in avgs) {
        if (stat in avgs) {
          avgs[stat] /= k;
        }
      }

      if (isBinary) {
        stats.precision = stats.truePos / (stats.truePos + stats.falsePos);
        stats.recall = stats.truePos / (stats.truePos + stats.falseNeg);
        stats.accuracy = (stats.trueNeg + stats.truePos) / stats.total;
      }

      stats.testSize = size;
      stats.trainSize = data.length - size;

      return this.json = {
        avgs: avgs,
        stats: stats,
        sets: results
      };
    }
  }, {
    key: 'toNeuralNetwork',
    value: function toNeuralNetwork() {
      return this.fromJSON(this.json);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.json;
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(crossValidateJson) {
      var Classifier = this.Classifier;
      var json = crossValidateJson.sets.reduce(function (prev, cur) {
        return prev.error < cur.error ? prev : cur;
      }, { error: Infinity }).network;
      if (Classifier.fromJSON) {
        return Classifier.fromJSON(json);
      }
      var instance = new Classifier();
      instance.fromJSON(json);
      return instance;
    }
  }]);

  return CrossValidate;
}();

exports.default = CrossValidate;
//# sourceMappingURL=cross-validate.js.map