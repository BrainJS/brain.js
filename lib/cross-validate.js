var _ = require("underscore")._;

function testPartition(classifierConst, options, trainSet, testSet) {
  var classifier = new classifierConst(options);

  var beginTrain = Date.now();

  classifier.trainAll(trainSet);

  var beginTest = Date.now();

  var error = classifier.test(testSet);

  var endTest = Date.now();

  return {
    error : error,
    trainTime : beginTest - beginTrain,
    testTime : endTest - beginTest,
  };
}

module.exports = function crossValidate(classifierConst, options, data, k) {
  k = k || 3;
  var size = data.length / k;

  data = _(data).sortBy(function(num){
    return Math.random();
  });

  var avgs = {
    error : 0,
    trainTime : 0,
    testTime : 0,
  };

  var results = _.range(k).map(function(i) {
    var dclone = _(data).clone();
    var testSet = dclone.splice(i * size, size);
    var trainSet = dclone;

    var result = testPartition(classifierConst, options, trainSet, testSet);

    _(avgs).each(function(sum, i) {
      avgs[i] = sum + result[i];
    });
  });

  _(avgs).each(function(sum, i) {
    avgs[i] = sum / k;
  });

  avgs.testSize = size;
  avgs.trainSize = data.length - size;

  return avgs;
}