import assert from 'assert';
import brain from '../../src';

describe('log', () => {
  let logCalled = false;

  beforeEach(() => { logCalled = false; });

  function logFunction(str) {
    logCalled = true;
  }

  function trainWithLog(log, expected) {
    let net = new brain.NeuralNetwork();
    net.train(
      [ { input: [0], output: [0] } ],
      { log: log, logPeriod: 1, iterations: 1 }
    );
    assert.equal(logCalled, expected)
  }

  function trainWithLogAsync(log, expected, done) {
    let net = new brain.NeuralNetwork();
    net
      .trainAsync(
        [ {input: [0], output: [0]} ],
        { log: log, logPeriod: 1, iterations: 1 }
      )
      .then(res => {
        assert.equal(logCalled, expected);
        done();
      })
      .catch(err => { assert.ok(false, err.toString()) });
  }

  it('should call log method', () => { trainWithLog(logFunction, true); });
  it('should not call log method', () => { trainWithLog(false, false); });
});
