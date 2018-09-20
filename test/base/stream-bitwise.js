import assert from 'assert';
import brain from '../../src';

class StreamTester {
  constructor(opts) {
    this.wiggle = opts.wiggle || 0.1;
    this.op = opts.op;

    this.testData = opts.testData;
    this.fakeBuffer = [];
    this.errorThresh = opts.errorThresh || 0.004;

    this.net = new brain.NeuralNetwork();

    this.trainStream = new brain.TrainStream({
      neuralNetwork: this.net,
      floodCallback: this.flood.bind(this),
      doneTrainingCallback: this.doneTraining.bind(this),
      errorThresh: this.errorThresh // error threshold to reach
    });
    this.flood();
  }

  /**
   * Every time you finish an epoch of flood, you must write null to the stream to let it know we have reached the end of the epoch
   */
  flood() {
    const { testData } = this;
    for (let i = testData.length - 1; i >= 0; i--) {
      this.trainStream.write(testData[i]);
    }

    this.trainStream.end();
  }

  doneTraining(info) {
    const { net, testData, wiggle, op } = this;
    for (let i in testData) {
      let output = net.run(testData[i].input)[0];
      let target = testData[i].output;
      assert.ok(output < (target + wiggle) && output > (target - wiggle),
        `failed to train ${ op } - output: ${ output } target: ${ target }`);
    }
  }
}


function testBitwise(data, op) {
  new StreamTester({
    testData: data,
    op: op,
    wiggle: 0.1,
    errorThresh: 0.003
  });
}

describe('bitwise functions', () => {

  it('NOT function', () => {
    let not = [{
      input: [0],
      output: [1]
    }, {
      input: [1],
      output: [0]
    }];
    testBitwise(not, 'not');
  });

  it('XOR function', () => {
    let xor = [{
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
    testBitwise(xor, 'xor');
  });

  it('OR function', () => {
    let or = [{
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
    testBitwise(or, 'or');
  });

  it('AND function', () => {
    let and = [{
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
    testBitwise(and, 'and');
  });
});
