require("underscore");

function testSet(classifierFunc, options, trainingSet, testingSet) {
  var classifier = new classifierFunc(options);
  
  var t1 = Date.now();
  classifier.train(trainingSet);
  var t2 = Date.now();
  var error = classifier.test(testingSet);
  var t3 = Date.now();
  
  return {
    error : error,
    trainTime : t2 - t1,
    testTime : t3 - t2,
    trainSize: trainingSet.length,
    testSize: testingSet.length 
  };
}

exports.crossValidate = function(classifierFunc, options, data, slices) {
  var sliceSize = data.length / slices;
  var partitions = _.range(slices).map(function(i) {
    var dclone = _(data).clone();
    return [dclone.splice(i * sliceSize, sliceSize), dclone];
  });

  var results = _(partitions).map(function(partition, i) {
    return testSet(classifierFunc, options, partition[1], partition[0]);
  });
  return results;
}