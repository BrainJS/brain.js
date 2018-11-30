import assert from 'assert';
import NeuralNetwork from '../../src/neural-network';
import TrainStream from '../../src/train-stream';
import LSTMTimeStep from '../../src/recurrent/lstm-time-step';

describe('TrainStream', () => {
  const wiggle = 0.1;
  const errorThresh = 0.003;
  function testTrainer(net, opts) {
    const { data } = opts;
    return new Promise((resolve) => {
      const trainStream = new TrainStream(Object.assign({}, opts,{
        neuralNetwork: net,
        floodCallback: flood,
        doneTrainingCallback: resolve
      }));

      /**
       * kick off the stream
       */
      flood();

      /**
       * Every time you finish an epoch of flood call `trainStream.endInputs()`
       */
      function flood() {
        for (let i = data.length - 1; i >= 0; i--) {
          trainStream.write(data[i]);
        }
        trainStream.endInputs();
      }
    });
  }

  describe('using sparse training values', () => {
    it('can train fruit', () => {
      const trainingData = [
        { input: { apple: 1 }, output: { pome: 1 } },
        { input: { pear: 1 }, output: { pome: 1 } },
        { input: { hawthorn: 1 }, output: { pome: 1 } },
        { input: { peach: 1 }, output: { drupe: 1 } },
        { input: { plum: 1 }, output: { drupe: 1 } },
        { input: { cherry: 1 }, output: { drupe: 1 } },
        { input: { grape: 1 }, output: { berry: 1 } },
        { input: { tomato: 1 }, output: { berry: 1 } },
        { input: { eggplant: 1 }, output: { berry: 1 } },
        { input: { kiwis: 1 }, output: { berry: 1 } },
        { input: { persimmon: 1 }, output: { berry: 1 } },
        { input: { raspberry: 1 }, output: { aggregate: 1 } },
        { input: { blackberry: 1 }, output: { aggregate: 1 } },
        { input: { strawberry: 1 }, output: { aggregate: 1 } },
        { input: { watermelon: 1 }, output: { pepo : 1 } },
        { input: { cantaloupe: 1 }, output: { pepo : 1 } },
        { input: { cucumber: 1 }, output: { pepo : 1 } },
        { input: { squash: 1 }, output: { pepo : 1 } },
        { input: { lemon: 1 }, output: { modified: 1 } },
        { input: { orange: 1 }, output: { modified: 1 } },
      ];

      function largestKey(object) {
        let max = -Infinity;
        let maxKey = null;
        for (let key in object) {
          if (object[key] > max) {
            max = object[key];
            maxKey = key;
          }
        }
        return maxKey;
      }
      const net = new NeuralNetwork();
      return testTrainer(net, { data: trainingData, errorThresh: 0.001 })
        .then((info) => {
          for (let i in trainingData) {
            const output = net.run(trainingData[i].input);
            const target = trainingData[i].output;

            const outputKey = largestKey(output);
            const targetKey = largestKey(target);
            assert.equal(outputKey, targetKey, `failed to train fruit - output key: ${ outputKey } targetKey: ${ targetKey }`);
            assert.ok(output[outputKey] < (target[targetKey] + wiggle) && output[outputKey] > (target[targetKey] - wiggle), `failed to train not - output: ${ output[outputKey] } target: ${ target[targetKey] } for ${ outputKey }`);
          }
        });
    });
  });
  describe('bitwise functions', () => {
    describe('using arrays', () => {
      it('NOT function', () => {
        const not = [{
          input: [0],
          output: [1]
        }, {
          input: [1],
          output: [0]
        }];
        const net = new NeuralNetwork();
        return testTrainer(net, { data: not, errorThresh })
          .then((info) => {
            for (let i in not) {
              let output = net.run(not[i].input)[0];
              let target = not[i].output[0];
              assert.ok(output < (target + wiggle) && output > (target - wiggle), `failed to train not - output: ${ output } target: ${ target }`);
            }
          });
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
        const net = new NeuralNetwork();
        return testTrainer(net, { data: xor, errorThresh })
          .then((info) => {
            for (let i in xor) {
              let output = net.run(xor[i].input)[0];
              let target = xor[i].output[0];
              assert.ok(output < (target + wiggle) && output > (target - wiggle), `failed to train xor - output: ${ output } target: ${ target }`);
            }
          });
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
        const net = new NeuralNetwork();
        return testTrainer(net, { data: or, errorThresh })
          .then((info) => {
            for (let i in or) {
              let output = net.run(or[i].input)[0];
              let target = or[i].output[0];
              assert.ok(output < (target + wiggle) && output > (target - wiggle), `failed to train or - output: ${ output } target: ${ target }`);
            }
          });
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
        const net = new NeuralNetwork();
        return testTrainer(net, { data: and, errorThresh })
          .then((info) => {
            for (let i in and) {
              let output = net.run(and[i].input)[0];
              let target = and[i].output[0];
              assert.ok(output < (target + wiggle) && output > (target - wiggle), `failed to train and - output: ${ output } target: ${ target }`);
            }
          });
      });
    });
    describe('objects', () => {
      it('AND function', () => {
        let and = [{
          input: { left: 0, right: 0},
          output: { product: 0 }
        }, {
          input: { left: 0, right: 1 },
          output: { product: 0 }
        }, {
          input: { left: 1, right: 0 },
          output: { product: 0 }
        }, {
          input: { left: 1, right: 1 },
          output: { product: 1 }
        }];
        const net = new NeuralNetwork();
        return testTrainer(net, { data: and, errorThresh })
          .then((info) => {
            for (let i in and) {
              let output = net.run(and[i].input).product;
              let target = and[i].output.product;
              assert.ok(output < (target + wiggle) && output > (target - wiggle), `failed to train and - output: ${ output } target: ${ target }`);
            }
          });
      });
    });
  });

  describe('RNNTimeStep compatibility', () => {
    it('can average error for array,array, counting forwards and backwards', () => {
      const iterations = 50;
      const data = [
        [.1,.2,.3,.4,.5],
        [.2,.3,.4,.5,.6],
        [.3,.4,.5,.6,.7],
        [.4,.5,.6,.7,.8],
        [.5,.6,.7,.8,.9]
      ];

      const net = new LSTMTimeStep({ hiddenLayers: [10] });

      return testTrainer(net, { data, iterations })
        .then((info) => {
          assert.ok(info.error < 0.05);
          assert.equal(info.iterations, iterations);

          for (let i = 0; i < data.length; i++) {
            const value = data[i];
            assert.equal(net.run(value.slice(0, 4)).toFixed(1), value[4].toFixed(1));
          }
        });
    });
  });
});
