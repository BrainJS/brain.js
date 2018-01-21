import assert from 'assert';
import brain from '../../src';

describe('neural network options', function () {
  this.timeout(15000);

  it('hiddenLayers', function () {
    let net = new brain.NeuralNetwork({ hiddenLayers: [8, 7] });

    net.train([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ]);

    let json = net.toJSON();

    assert.equal(json.layers.length, 4);
    assert.equal(Object.keys(json.layers[1]).length, 8);
    assert.equal(Object.keys(json.layers[2]).length, 7);
  });

  it('hiddenLayers default expand to input size', function () {
    let net = new brain.NeuralNetwork();

    net.train ([
      { input: [0, 0, 1, 1, 1, 1, 1, 1, 1], output: [0]},
      { input: [0, 1, 1, 1, 1, 1, 1, 1, 1], output: [1]},
      { input: [1, 0, 1, 1, 1, 1, 1, 1, 1], output: [1]},
      { input: [1, 1, 1, 1, 1, 1, 1, 1, 1], output: [0]}
    ]);

    let json = net.toJSON();

    assert.equal(json.layers.length, 3);
    assert.equal(Object.keys(json.layers[1]).length, 4, `9 input units should be 4 hidden not ${Object.keys(json.layers[1]).length}`);
  });

  it('learningRate - higher learning rate should train faster', function () {
    let data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] }
    ];

    let net = new brain.NeuralNetwork();
    let res = net.train (data, { learningRate: 0.5 });

    let net2 = new brain.NeuralNetwork();
    let res2 = net2.train (data, { learningRate: 0.8 });

    assert.ok(res.iterations > (res2.iterations * 1.1), `${res.iterations} should be greater than ${res2.iterations * 1.1}`);
  });

  it('learningRate ASYNC - higher learning rate should train faster', (done) => {
    let data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] }
    ];

    let net = new brain.NeuralNetwork();
    let net2 = new brain.NeuralNetwork();

    net.trainAsync (data, { learningRate: 0.5 }, (res) => {
      net2.trainAsync (data, { learningRate: 0.8 }, (res2) => {
        assert.ok(res.iterations > (res2.iterations * 1.1), `${res.iterations} !> ${res2.iterations * 1.1}`);
        done ();
      });
    });
  }).timeout(5000);

  it('momentum - higher momentum should train faster', function () {
    let data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] }
    ];

    let net = new brain.NeuralNetwork({ momentum: 0.1 });
    let res = net.train (data)

    let net2 = new brain.NeuralNetwork({ momentum: 0.5 });
    let res2 = net2.train (data)

    assert.ok(res.iterations > (res2.iterations * 1.1), `${res.iterations} !> ${res2.iterations * 1.1}`);
  });

  it('momentum ASYNC - higher momentum should train faster', (done) => {
    let data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] }
    ];

    let net = new brain.NeuralNetwork({ momentum: 0.1 });
    let net2 = new brain.NeuralNetwork({ momentum: 0.5 });

    net.trainAsync (data, (res) => {
      net2.trainAsync (data, (res2) => {
        assert.ok(res.iterations > (res2.iterations * 1.1), `${res.iterations} !> ${res2.iterations * 1.1}`);
        done ();
      });
    });
  });
}).timeout(5000);

describe('log', function () {
  let logCalled;
  let oldLog;

  beforeEach (function () { logCalled = false; });

  before (function () { oldLog = console.log; console.log = logFunction; });
  after (function () { console.log = oldLog; });

  function logFunction(str) {
    if (typeof str === "string" && !str.includes('iterations:') && !str.includes('training error:')) {
      oldLog(str);
    } else {
      logCalled = true;
    }
  }

  function trainWithLog (log, expected) {
    let net = new brain.NeuralNetwork();
    net.train (
      [ { input: [0], output: [0] } ],
      { log: log, logPeriod: 1, iterations: 1 }
    );
    assert.equal(logCalled, expected)
  }

  function trainWithLogAsync (log, expected, done) {
    let net = new brain.NeuralNetwork();
    net.trainAsync (
      [ {input: [0], output: [0]} ],
      { log: log, logPeriod: 1, iterations: 1 },
      function (_) { assert.equal (logCalled, expected); done (); }
    );
  }

  // TODO fix this test :(
  it('should call console.log if log === true', function () { trainWithLog (true, true); });
  it('should call console.log if log === false', function () { trainWithLog (false, false); });

  it('ASYNC should call console.log if log === true', function (done) { trainWithLogAsync (true, true, done); }).timeout(5000);
  it('ASYNC should call console.log if log === false', function (done) { trainWithLogAsync (false, false, done); }).timeout(5000);
});
