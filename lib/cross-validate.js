'use strict';

function testPartition(Classifier, opts, trainOpts, trainSet, testSet) {
  var classifier = new Classifier(opts);

  var beginTrain = Date.now();

  var trainingStats = classifier.train(trainSet, trainOpts);

  var beginTest = Date.now();

  var testStats = classifier.test(testSet);

  var endTest = Date.now();

  var stats = Object.assign({}, testStats, {
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
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

module.exports = function crossValidate(Classifier, data, opts, trainOpts, k) {
  k = k || 4;
  var size = data.length / k;

  if (data.constructor === Array) {
    shuffleArray(data);
  } else {
    var newData = {};
    shuffleArray(Object.keys(data)).forEach(function(key) {
      newData[key] = data[key];
    });
    data = newData;
  }

  var avgs = {
    error : 0,
    trainTime : 0,
    testTime : 0,
    iterations: 0,
    trainError: 0
  };

  var stats = {
    truePos: 0,
    trueNeg: 0,
    falsePos: 0,
    falseNeg: 0,
    total: 0
  };

  var misclasses = [];
  var results = [];
  var stat;
  var sum;

  for (var i = 0; i < k; i++) {
    var dclone = data.slice(0);
    var testSet = dclone.splice(i * size, size);
    var trainSet = dclone;
    var result = testPartition(Classifier, opts, trainOpts, trainSet, testSet);
    for (stat in avgs) {
      if (avgs.hasOwnProperty(stat)) {
        sum = avgs[stat];
        avgs[stat] = sum + result[stat];
      }
    }

    for (stat in stats) {
      if (stats.hasOwnProperty(stat)) {
        sum = stats[stat];
        stats[stat] = sum + result[stat];
      }
    }

    misclasses.concat(results.misclasses);

    results.push(result);
  }

  for (stat in avgs) {
    if (avgs.hasOwnProperty(stat)) {
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
};
