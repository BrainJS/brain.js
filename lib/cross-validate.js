var _ = require("underscore")._;

function testPartition(classifierConst, opts, trainOpts, trainSet, testSet) {
  var classifier = new classifierConst(opts);

  var beginTrain = Date.now();

  var trainingStats = classifier.train(trainSet, trainOpts);

  var beginTest = Date.now();

  var testStats = classifier.test(testSet);

  var endTest = Date.now();

  var stats = _(testStats).extend({
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

module.exports = function crossValidate(classifierConst, data, opts, trainOpts, k) {
  k = k || 4;
  var size = data.length / k;

  data = _(data).sortBy(function() {
    return Math.random();
  });

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

  var results = _.range(k).map(function(i) {
    var dclone = _(data).clone();
    var testSet = dclone.splice(i * size, size);
    var trainSet = dclone;

    var result = testPartition(classifierConst, opts, trainOpts, trainSet, testSet);

    _(avgs).each(function(sum, stat) {
      avgs[stat] = sum + result[stat];
    });

    _(stats).each(function(sum, stat) {
      stats[stat] = sum + result[stat];
    })

    misclasses.push(result.misclasses);

    return result;
  });

  _(avgs).each(function(sum, i) {
    avgs[i] = sum / k;
  });

  stats.precision = stats.truePos / (stats.truePos + stats.falsePos);
  stats.recall = stats.truePos / (stats.truePos + stats.falseNeg);
  stats.accuracy = (stats.trueNeg + stats.truePos) / stats.total;

  stats.testSize = size;
  stats.trainSize = data.length - size;

  return {
    avgs: avgs,
    stats: stats,
    sets: results,
    misclasses: _(misclasses).flatten()
  };
}
