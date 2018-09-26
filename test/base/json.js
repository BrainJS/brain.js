import assert from 'assert';
import NeuralNetwork from './../../src/neural-network';

describe('JSON', () => {
  const originalNet = new NeuralNetwork();

  let trainingOpts = {
    iterations: 200,
    errorThresh: 0.05,
    log: () => {},
    logPeriod: 3,
    learningRate: 0.03,
    momentum: 0.01,
    callbackPeriod: 5,
    timeout: 3000 
  }
  originalNet.train([
    {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }, {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }
  ], trainingOpts);

  trainingOpts.log = true;

  const serialized = originalNet.toJSON();
  const serializedNet = new NeuralNetwork()
    .fromJSON(
      JSON.parse(
        JSON.stringify(serialized)
      )
    );

  const input = {'0' : Math.random(), b: Math.random()};
  describe('.toJSON()', () => {
    describe('.layers', () => {

      it('layer count is correct', () => {
        assert.equal(serialized.layers.length, 3);
        originalNet.sizes.forEach((size, i) => {
          assert.equal(size, Object.keys(serialized.layers[i]).length);
        });
      });

      describe('input layer', () => {
        const inputLayer = serialized.layers[0];
        it('is empty, but describes input', () => {
          const keys = Object.keys(inputLayer);
          assert(keys.length === 2);
          assert(inputLayer.hasOwnProperty('0'));
          assert(inputLayer.hasOwnProperty('b'));
          assert(Object.keys(inputLayer['0']).length === 0);
          assert(Object.keys(inputLayer['b']).length === 0);
        });
      });

      describe('hidden layers', () => {
        it('are populated exactly from original net', () => {
          assert.equal(serialized.layers[1][0].bias, originalNet.biases[1][0]);
          assert.equal(serialized.layers[1][1].bias, originalNet.biases[1][1]);
          assert.equal(serialized.layers[1][2].bias, originalNet.biases[1][2]);
          assert.equal(serialized.layers[2]['0'].bias, originalNet.biases[2][0]);
          assert.equal(serialized.layers[2]['c'].bias, originalNet.biases[2][1]);
        });
      });
    });

    describe('.activation', () => {
      it('exports correctly', () => {
        assert.equal(serialized.activation, originalNet.activation);
      });
    });

    describe('.trainOpts', () => {
      it('training options iterations', () => {
        assert.equal(trainingOpts.iterations, serialized.trainOpts.iterations, `trainingOpts are: ${trainingOpts.iterations} serialized should be the same but are: ${serialized.trainOpts.iterations}`);
      });

      it('training options errorThresh', () => {
        assert.equal(trainingOpts.errorThresh, serialized.trainOpts.errorThresh, `trainingOpts are: ${trainingOpts.errorThresh} serialized should be the same but are: ${serialized.trainOpts.errorThresh}`);
      });

      it('training options log', () => {
        assert.equal(trainingOpts.log, serialized.trainOpts.log, `log are: ${trainingOpts.log} serialized should be the same but are: ${serialized.trainOpts.log}`);
      });

      it('training options logPeriod', () => {
        assert.equal(trainingOpts.logPeriod, serialized.trainOpts.logPeriod, `trainingOpts are: ${trainingOpts.logPeriod} serialized should be the same but are: ${serialized.trainOpts.logPeriod}`);
      });

      it('training options learningRate', () => {
        assert.equal(trainingOpts.learningRate, serialized.trainOpts.learningRate, `trainingOpts are: ${trainingOpts.learningRate} serialized should be the same but are: ${serialized.trainOpts.learningRate}`);
      });

      it('training options momentum', () => {
        assert.equal(trainingOpts.momentum, serialized.trainOpts.momentum, `trainingOpts are: ${trainingOpts.momentum} serialized should be the same but are: ${serialized.trainOpts.momentum}`);
      });

      it('training options callback', () => {
        assert.equal(trainingOpts.callback, serialized.trainOpts.callback, `trainingOpts are: ${trainingOpts.callback} serialized should be the same but are: ${serialized.trainOpts.callback}`);
      });

      it('training options callbackPeriod', () => {
        assert.equal(trainingOpts.callbackPeriod, serialized.trainOpts.callbackPeriod, `trainingOpts are: ${trainingOpts.callbackPeriod} serialized should be the same but are: ${serialized.trainOpts.callbackPeriod}`);
      });

      it('training options timeout', () => {
        assert.equal(trainingOpts.timeout, serialized.trainOpts.timeout, `trainingOpts are: ${trainingOpts.timeout} serialized should be the same but are: ${serialized.trainOpts.timeout}`);
      });
    });

  });

  describe('.fromJSON()', () => {
    describe('importing values', () => {
      describe('.layers', () => {
        it('layer count is correct', () => {
          assert.equal(serializedNet.biases.length, 3);
          assert.equal(serializedNet.biases['1'].length, 3);
          assert.equal(serializedNet.weights.length, 3);
        });

        describe('hidden layers', () => {
          it('are populated exactly from serialized', () => {
            assert.equal(serializedNet.biases[1][0], serialized.layers[1][0].bias);
            assert.equal(serializedNet.biases[1][1], serialized.layers[1][1].bias);
            assert.equal(serializedNet.biases[1][2], serialized.layers[1][2].bias);
            assert.equal(serializedNet.biases[2][0], serialized.layers[2]['0'].bias);
            assert.equal(serializedNet.biases[2][1], serialized.layers[2]['c'].bias);
          });
        });
      });

      describe('.activation', () => {
        it('exports correctly', () => {
          assert.equal(serializedNet.activation, serialized.activation);
        });
      });

      describe('.trainOpts', () => {
        it('training options iterations', () => {
          assert.equal(trainingOpts.iterations, serializedNet.trainOpts.iterations, `trainingOpts are: ${trainingOpts.iterations} serializedNet should be the same but are: ${serializedNet.trainOpts.iterations}`);
        });
  
        it('training options errorThresh', () => {
          assert.equal(trainingOpts.errorThresh, serializedNet.trainOpts.errorThresh, `trainingOpts are: ${trainingOpts.errorThresh} serializedNet should be the same but are: ${serializedNet.trainOpts.errorThresh}`);
        });
  
        it('training options log', () => {
          // Should have inflated to console.log
          assert.equal(console.log, serializedNet.trainOpts.log, `log are: ${trainingOpts.log} serializedNet should be the same but are: ${serializedNet.trainOpts.log}`);
        });
  
        it('training options logPeriod', () => {
          assert.equal(trainingOpts.logPeriod, serializedNet.trainOpts.logPeriod, `trainingOpts are: ${trainingOpts.logPeriod} serializedNet should be the same but are: ${serializedNet.trainOpts.logPeriod}`);
        });
  
        it('training options learningRate', () => {
          assert.equal(trainingOpts.learningRate, serializedNet.trainOpts.learningRate, `trainingOpts are: ${trainingOpts.learningRate} serializedNet should be the same but are: ${serializedNet.trainOpts.learningRate}`);
        });
  
        it('training options momentum', () => {
          assert.equal(trainingOpts.momentum, serializedNet.trainOpts.momentum, `trainingOpts are: ${trainingOpts.momentum} serializedNet should be the same but are: ${serializedNet.trainOpts.momentum}`);
        });
  
        it('training options callback', () => {
          assert.equal(trainingOpts.callback, serializedNet.trainOpts.callback, `trainingOpts are: ${trainingOpts.callback} serializedNet should be the same but are: ${serializedNet.trainOpts.callback}`);
        });
  
        it('training options callbackPeriod', () => {
          assert.equal(trainingOpts.callbackPeriod, serializedNet.trainOpts.callbackPeriod, `trainingOpts are: ${trainingOpts.callbackPeriod} serializedNet should be the same but are: ${serializedNet.trainOpts.callbackPeriod}`);
        });
  
        it('training options timeout', () => {
          assert.equal(trainingOpts.timeout, serializedNet.trainOpts.timeout, `trainingOpts are: ${trainingOpts.timeout} serializedNet should be the same but are: ${serializedNet.trainOpts.timeout}`);
        });
      });
    });

    it('can run originalNet, and serializedNet, with same output', () => {
      const output1 = originalNet.run(input);
      const output2 = serializedNet.run(input);
      assert.deepEqual(output2, output1,
        'loading json serialized network failed');
    });

    it('if json.trainOpts is not set, ._updateTrainingOptions() is not called abd activation defaults to sigmoid', () => {
      const net = new NeuralNetwork();
      net._updateTrainingOptions = () => {
        throw new Error('_updateTrainingOptions was called');
      };
      net.fromJSON({ sizes: [], layers: [] });
      assert(net.activation === 'sigmoid');
    })
  });
});


describe('default net json', () => {
  const originalNet = new NeuralNetwork();

  originalNet.train([
    {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }, {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }
  ]);

  const serialized = originalNet.toJSON();
  const serializedNet = new NeuralNetwork()
    .fromJSON(
      JSON.parse(
        JSON.stringify(serialized)
      )
    );

  const input = {'0' : Math.random(), b: Math.random()};

  describe('.trainOpts', () => {
    it('training options iterations', () => {
      assert.equal(originalNet.trainOpts.iterations, serializedNet.trainOpts.iterations, `originalNet.trainOpts are: ${originalNet.trainOpts.iterations} serializedNet should be the same but are: ${serializedNet.trainOpts.iterations}`);
    });

    it('training options errorThresh', () => {
      assert.equal(originalNet.trainOpts.errorThresh, serializedNet.trainOpts.errorThresh, `originalNet.trainOpts are: ${originalNet.trainOpts.errorThresh} serializedNet should be the same but are: ${serializedNet.trainOpts.errorThresh}`);
    });

    it('training options log', () => {
      // Should have inflated to console.log
      assert.equal(originalNet.trainOpts.log, serializedNet.trainOpts.log, `log are: ${originalNet.trainOpts.log} serializedNet should be the same but are: ${serializedNet.trainOpts.log}`);
    });

    it('training options logPeriod', () => {
      assert.equal(originalNet.trainOpts.logPeriod, serializedNet.trainOpts.logPeriod, `originalNet.trainOpts are: ${originalNet.trainOpts.logPeriod} serializedNet should be the same but are: ${serializedNet.trainOpts.logPeriod}`);
    });

    it('training options learningRate', () => {
      assert.equal(originalNet.trainOpts.learningRate, serializedNet.trainOpts.learningRate, `originalNet.trainOpts are: ${originalNet.trainOpts.learningRate} serializedNet should be the same but are: ${serializedNet.trainOpts.learningRate}`);
    });

    it('training options momentum', () => {
      assert.equal(originalNet.trainOpts.momentum, serializedNet.trainOpts.momentum, `originalNet.trainOpts are: ${originalNet.trainOpts.momentum} serializedNet should be the same but are: ${serializedNet.trainOpts.momentum}`);
    });

    it('training options callback', () => {
      assert.equal(originalNet.trainOpts.callback, serializedNet.trainOpts.callback, `originalNet.trainOpts are: ${originalNet.trainOpts.callback} serializedNet should be the same but are: ${serializedNet.trainOpts.callback}`);
    });

    it('training options callbackPeriod', () => {
      assert.equal(originalNet.trainOpts.callbackPeriod, serializedNet.trainOpts.callbackPeriod, `originalNet.trainOpts are: ${originalNet.trainOpts.callbackPeriod} serializedNet should be the same but are: ${serializedNet.trainOpts.callbackPeriod}`);
    });

    it('training options timeout', () => {
      assert.equal(originalNet.trainOpts.timeout, serializedNet.trainOpts.timeout, `originalNet.trainOpts are: ${originalNet.trainOpts.timeout} serializedNet should be the same but are: ${serializedNet.trainOpts.timeout}`);
    });
  });

  it('can run originalNet, and serializedNet, with same output', () => {
    const output1 = originalNet.run(input);
    const output2 = serializedNet.run(input);
    assert.deepEqual(output2, output1,
      'loading json serialized network failed');
  });

  it('if json.trainOpts is not set, ._updateTrainingOptions() is not called and activation defaults to sigmoid', () => {
    const net = new NeuralNetwork();
    net._updateTrainingOptions = () => {
      throw new Error('_updateTrainingOptions was called');
    };
    net.fromJSON({ sizes: [], layers: [] });
    assert(net.activation === 'sigmoid');
  })
})