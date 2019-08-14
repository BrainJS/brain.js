class CrossValidate {

  /**
   *
   * @param {NeuralNetwork|constructor} Classifier
   * @param {object} [options]
   */
  constructor(Classifier, options) {
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
  testPartition(trainOpts, trainSet, testSet) {
    const classifier = new this.Classifier(this.options);
    const beginTrain = Date.now();
    const trainingStats = classifier.train(trainSet, trainOpts);
    const beginTest = Date.now();
    const testStats = classifier.test(testSet);
    const endTest = Date.now();
    const stats = Object.assign({}, testStats, {
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
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
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
  train(data, trainOpts = {}, k = 4) {
    if (data.length < k) {
      throw new Error(`Training set size is too small for ${ data.length } k folds of ${ k }`);
    }

    const size = data.length / k;

    if (data.constructor === Array) {
      this.shuffleArray(data);
    } else {
      const newData = {};
      this.shuffleArray(Object.keys(data)).forEach((key) => {
        newData[key] = data[key];
      });
      data = newData;
    }

    const avgs = {
      trainTime: 0,
      testTime: 0,
      iterations: 0,
      error: 0
    };

    const stats = {
      total: 0
    };

    const binaryStats = {
      total: 0,
      truePos: 0,
      trueNeg: 0,
      falsePos: 0,
      falseNeg: 0
    };

    const results = [];
    let stat;
    let isBinary = null;

    for (let i = 0; i < k; i++) {
      const dclone = data.slice(0);
      const testSet = dclone.splice(i * size, size);
      const trainSet = dclone;
      const result = this.testPartition(trainOpts, trainSet, testSet);

      if (isBinary === null) {
        isBinary =
          result.hasOwnProperty('falseNeg')
          && result.hasOwnProperty('falsePos')
          && result.hasOwnProperty('trueNeg')
          && result.hasOwnProperty('truePos');
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

  toNeuralNetwork() {
    return this.fromJSON(this.json);
  }

  toJSON() {
    return this.json;
  }

  fromJSON(crossValidateJson) {
    const Classifier = this.Classifier;
    const json = crossValidateJson.sets.reduce((prev, cur) => prev.error < cur.error ? prev : cur, {error: Infinity}).network;
    if (Classifier.fromJSON) {
      return Classifier.fromJSON(json);
    }
    const instance = new Classifier();
    instance.fromJSON(json);
    return instance;
  }
}

module.exports = CrossValidate;
