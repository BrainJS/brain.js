/**
 *
 * @param {NeuralNetwork|constructor} Classifier
 * @param {object} opts
 * @param {object} trainOpts
 * @param {object} trainSet
 * @param {object} testSet
 * @returns {void|*}
 */
export function testPartition(Classifier, opts, trainOpts, trainSet, testSet) {
  let classifier = new Classifier(opts);
  let beginTrain = Date.now();
  let trainingStats = classifier.train(trainSet, trainOpts);
  let beginTest = Date.now();
  let testStats = classifier.test(testSet);
  let endTest = Date.now();
  let stats = Object.assign({}, testStats, {
    trainTime : beginTest - beginTrain,
    testTime : endTest - beginTest,
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
export function shuffleArray(array) {
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
export default function crossValidate(Classifier, data, opts, trainOpts, k) {
  k = k || 4;
  let size = data.length / k;

  if (data.constructor === Array) {
    shuffleArray(data);
  } else {
    let newData = {};
    shuffleArray(Object.keys(data)).forEach((key) => {
      newData[key] = data[key];
    });
    data = newData;
  }

  let avgs = {
    error : 0,
    trainTime : 0,
    testTime : 0,
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

  let misclasses = [];
  let results = [];
  let stat;
  let sum;

  for (let i = 0; i < k; i++) {
    let dclone = data.slice(0);
    let testSet = dclone.splice(i * size, size);
    let trainSet = dclone;
    let result = testPartition(Classifier, opts, trainOpts, trainSet, testSet);
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

    misclasses.concat(results.misclasses);

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

  return {
    avgs: avgs,
    stats: stats,
    sets: results,
    misclasses: misclasses
  };
}
