/**
 *
 * @param {NeuralNetwork|constructor} Classifier
 * @param {object} opts
 * @param {object} trainOpts
 * @param {object} trainSet
 * @param {object} testSet
 * @returns {void|*}
 */
function testPartition(Classifier, opts, trainOpts, trainSet, testSet) {
  const classifier = new Classifier(opts);
  const beginTrain = Date.now();
  const trainingStats = classifier.train(trainSet, trainOpts);
  const beginTest = Date.now();
  const testStats = classifier.test(testSet);
  const endTest = Date.now();
  const stats = Object.assign({}, testStats, {
    trainTime: beginTest - beginTrain,
    testTime: endTest - beginTest,
    iterations: trainingStats.iterations,
    trainError: trainingStats.error,
    learningRate: trainOpts.learningRate,
    hidden: classifier.hiddenSizes,
    network: classifier.toJSON(),
  });

  return stats;
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * source: http://stackoverflow.com/a/12646864/1324039
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/**
 *
 * @param {NeuralNetwork|constructor} Classifier
 * @param {object} data
 * @param {object} opts
 * @param {object} trainOpts
 * @param {number} k
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
 *    sets: Array,
 *    misclasses: Array
 *  }
 * }
 */
function crossValidate(Classifier, data, opts, trainOpts, k) {
  k = k || 4;
  const size = data.length / k;

  if (data.constructor === Array) {
    shuffleArray(data);
  } else {
    const newData = {};
    shuffleArray(Object.keys(data)).forEach(key => {
      newData[key] = data[key];
    });
    data = newData;
  }

  const avgs = {
    error: 0,
    trainTime: 0,
    testTime: 0,
    iterations: 0,
    trainError: 0,
  };

  const stats = {
    truePos: 0,
    trueNeg: 0,
    falsePos: 0,
    falseNeg: 0,
    total: 0,
  };

  const misclasses = [];
  const results = [];

  for (let i = 0; i < k; i++) {
    const dclone = data.slice(0);
    const testSet = dclone.splice(i * size, size);
    const trainSet = dclone;
    const result = testPartition(Classifier, opts, trainOpts, trainSet, testSet);

    Object.keys(avgs).forEach(avg => {
      avgs[avg] += result[avg];
    });

    Object.keys(stats).forEach(stat => {
      stats[stat] += result[stat];
    });

    misclasses.concat(results.misclasses);

    results.push(result);
  }

  Object.keys(avgs).forEach(avg => {
    avgs[avg] /= k;
  });

  stats.precision = stats.truePos / (stats.truePos + stats.falsePos);
  stats.recall = stats.truePos / (stats.truePos + stats.falseNeg);
  stats.accuracy = (stats.trueNeg + stats.truePos) / stats.total;

  stats.testSize = size;
  stats.trainSize = data.length - size;

  return {
    avgs,
    stats,
    sets: results,
    misclasses,
  };
}

module.exports = { testPartition, shuffleArray, crossValidate };
