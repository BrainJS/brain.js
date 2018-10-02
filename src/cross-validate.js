export default class CrossValidate {

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
    let classifier = new this.Classifier(this.options);
    let beginTrain = Date.now();
    let trainingStats = classifier.train(trainSet, trainOpts);
    let beginTest = Date.now();
    let testStats = classifier.test(testSet);
    let endTest = Date.now();
    let stats = Object.assign({}, testStats, {
      trainTime: beginTest - beginTrain,
      testTime: endTest - beginTest,
      iterations: trainingStats.iterations,
      trainError: trainingStats.error,
      learningRate: trainOpts.learningRate,
      hidden: classifier.hiddenSizes,
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
   *      trainError: number
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
    if (data.length <= k) {
      throw new Error(`Training set size is too small for ${ data.length } k folds of ${ k }`);
    }
    let size = data.length / k;

    if (data.constructor === Array) {
      this.shuffleArray(data);
    } else {
      let newData = {};
      this.shuffleArray(Object.keys(data)).forEach((key) => {
        newData[key] = data[key];
      });
      data = newData;
    }

    let avgs = {
      error: 0,
      trainTime: 0,
      testTime: 0,
      iterations: 0,
      trainError: 0
    };

    let stats = {
      truePos: 0,
      trueNeg: 0,
      falsePos: 0,
      falseNeg: 0,
      total: 0
    };

    let results = [];
    let stat;
    let sum;

    for (let i = 0; i < k; i++) {
      let dclone = data.slice(0);
      let testSet = dclone.splice(i * size, size);
      let trainSet = dclone;
      let result = this.testPartition(trainOpts, trainSet, testSet);
      for (stat in avgs) {
        if (stat in avgs) {
          sum = avgs[stat];
          avgs[stat] = sum + result[stat];
        }
      }

      for (stat in stats) {
        if (stat in stats) {
          sum = stats[stat];
          stats[stat] = sum + result[stat];
        }
      }

      results.push(result);
    }

    for (stat in avgs) {
      if (stat in avgs) {
        sum = avgs[stat];
        avgs[stat] = sum / k;
      }
    }

    stats.precision = stats.truePos / (stats.truePos + stats.falsePos);
    stats.recall = stats.truePos / (stats.truePos + stats.falseNeg);
    stats.accuracy = (stats.trueNeg + stats.truePos) / stats.total;

    stats.testSize = size;
    stats.trainSize = data.length - size;


    this.json = {
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
