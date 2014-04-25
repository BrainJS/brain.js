var assert = require("assert"),
    brain = require("../../lib/brain");

function StreamTester(opts) {
  if (!(this instanceof StreamTester)) return new StreamTester(opts);

  var self = this;

  this.wiggle = opts.wiggle || 0.1;
  this.op = opts.op;

  this.testData = opts.testData;
  this.fakeBuffer = [];
  this.errorThresh = opts.errorThresh || 0.004;

  this.net = new brain.NeuralNetwork();

  this.trainStream = this.net.createTrainStream({
    floodCallback: self.flood.bind(self),
    doneTrainingCallback: self.doneTraining.bind(self),
    errorThresh: self.errorThresh // error threshold to reach
  });
  this.flood();
}

/*
  Every time you finish an epoch of flood,
  you must write null to the stream
  to let it know we have reached the end of the epoch
 */
StreamTester.prototype.flood = function() {
  var self = this;

  for (var i = self.testData.length - 1; i >= 0; i--) {
    self.trainStream.write(self.testData[i]);
  }
  self.trainStream.write(null);
}

StreamTester.prototype.doneTraining = function(info) {
  var self = this;

  for (var i in self.testData) {
    var output = self.net.run(self.testData[i].input)[0];
    var target = self.testData[i].output;
    assert.ok(output < (target + self.wiggle) && output > (target - self.wiggle),
      "failed to train " + self.op + " - output: " + output + " target: " + target);
  }
}


function testBitwise(data, op) {
  var st = StreamTester({
    testData: data,
    op: op,
    wiggle: 0.1,
    errorThresh: 0.003
  });
}

describe('bitwise functions', function() {

  it('NOT function', function() {
    var not = [{
      input: [0],
      output: [1]
    }, {
      input: [1],
      output: [0]
    }];
    testBitwise(not, "not");
  })

  it('XOR function', function() {
    var xor = [{
      input: [0, 0],
      output: [0]
    }, {
      input: [0, 1],
      output: [1]
    }, {
      input: [1, 0],
      output: [1]
    }, {
      input: [1, 1],
      output: [0]
    }];
    testBitwise(xor, "xor");
  })

  it('OR function', function() {
    var or = [{
      input: [0, 0],
      output: [0]
    }, {
      input: [0, 1],
      output: [1]
    }, {
      input: [1, 0],
      output: [1]
    }, {
      input: [1, 1],
      output: [1]
    }];
    testBitwise(or, "or");
  });

  it('AND function', function() {
    var and = [{
      input: [0, 0],
      output: [0]
    }, {
      input: [0, 1],
      output: [0]
    }, {
      input: [1, 0],
      output: [0]
    }, {
      input: [1, 1],
      output: [1]
    }];
    testBitwise(and, "and");
  })
})
