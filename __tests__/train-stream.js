const NeuralNetwork = require('../src/neural-network');
const TrainStream = require('../src/train-stream');
const LSTMTimeStep = require('../src/recurrent/lstm-time-step');

describe('TrainStream', () => {
  const wiggle = 0.1;
  const errorThresh = 0.003;
  function testTrainer(net, opts) {
    const { data } = opts;
    return new Promise((resolve) => {
      const trainStream = new TrainStream(
        Object.assign({}, opts, {
          neuralNetwork: net,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          floodCallback: flood,
          doneTrainingCallback: resolve,
        })
      );

      /**
       * Every time you finish an epoch of flood call `trainStream.endInputs()`
       */
      function flood() {
        for (let i = data.length - 1; i >= 0; i--) {
          trainStream.write(data[i]);
        }
        trainStream.endInputs();
      }
      /**
       * kick off the stream
       */
      flood();
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
        { input: { watermelon: 1 }, output: { pepo: 1 } },
        { input: { cantaloupe: 1 }, output: { pepo: 1 } },
        { input: { cucumber: 1 }, output: { pepo: 1 } },
        { input: { squash: 1 }, output: { pepo: 1 } },
        { input: { lemon: 1 }, output: { modified: 1 } },
        { input: { orange: 1 }, output: { modified: 1 } },
      ];

      function largestKey(object) {
        let max = -Infinity;
        let maxKey = null;
        for (const key in object) {
          if (object[key] > max) {
            max = object[key];
            maxKey = key;
          }
        }
        return maxKey;
      }
      const net = new NeuralNetwork();
      return testTrainer(net, { data: trainingData, errorThresh: 0.001 }).then(
        () => {
          for (const i in trainingData) {
            const output = net.run(trainingData[i].input);
            const target = trainingData[i].output;

            const outputKey = largestKey(output);
            const targetKey = largestKey(target);
            expect(outputKey).toBe(targetKey);
            expect(
              output[outputKey] < target[targetKey] + wiggle &&
                output[outputKey] > target[targetKey] - wiggle
            ).toBeTruthy();
          }
        }
      );
    });
  });
  describe('bitwise functions', () => {
    describe('using arrays', () => {
      it('NOT function', () => {
        const not = [
          {
            input: [0],
            output: [1],
          },
          {
            input: [1],
            output: [0],
          },
        ];
        const net = new NeuralNetwork();
        return testTrainer(net, { data: not, errorThresh }).then(() => {
          for (const i in not) {
            const output = net.run(not[i].input)[0];
            const target = not[i].output[0];
            expect(
              output < target + wiggle && output > target - wiggle
            ).toBeTruthy();
          }
        });
      });

      it('XOR function', () => {
        const xor = [
          {
            input: [0, 0],
            output: [0],
          },
          {
            input: [0, 1],
            output: [1],
          },
          {
            input: [1, 0],
            output: [1],
          },
          {
            input: [1, 1],
            output: [0],
          },
        ];
        const net = new NeuralNetwork();
        return testTrainer(net, { data: xor, errorThresh }).then(() => {
          for (const i in xor) {
            const output = net.run(xor[i].input)[0];
            const target = xor[i].output[0];
            expect(
              output < target + wiggle && output > target - wiggle
            ).toBeTruthy();
          }
        });
      });

      it('OR function', () => {
        const or = [
          {
            input: [0, 0],
            output: [0],
          },
          {
            input: [0, 1],
            output: [1],
          },
          {
            input: [1, 0],
            output: [1],
          },
          {
            input: [1, 1],
            output: [1],
          },
        ];
        const net = new NeuralNetwork();
        return testTrainer(net, { data: or, errorThresh }).then(() => {
          for (const i in or) {
            const output = net.run(or[i].input)[0];
            const target = or[i].output[0];
            expect(
              output < target + wiggle && output > target - wiggle
            ).toBeTruthy();
          }
        });
      });

      it('AND function', () => {
        const and = [
          {
            input: [0, 0],
            output: [0],
          },
          {
            input: [0, 1],
            output: [0],
          },
          {
            input: [1, 0],
            output: [0],
          },
          {
            input: [1, 1],
            output: [1],
          },
        ];
        const net = new NeuralNetwork();
        return testTrainer(net, { data: and, errorThresh }).then(() => {
          for (const i in and) {
            const output = net.run(and[i].input)[0];
            const target = and[i].output[0];
            expect(
              output < target + wiggle && output > target - wiggle
            ).toBeTruthy();
          }
        });
      });
    });
    describe('objects', () => {
      it('AND function', () => {
        const and = [
          {
            input: { left: 0, right: 0 },
            output: { product: 0 },
          },
          {
            input: { left: 0, right: 1 },
            output: { product: 0 },
          },
          {
            input: { left: 1, right: 0 },
            output: { product: 0 },
          },
          {
            input: { left: 1, right: 1 },
            output: { product: 1 },
          },
        ];
        const net = new NeuralNetwork();
        return testTrainer(net, { data: and, errorThresh }).then(() => {
          for (const i in and) {
            const output = net.run(and[i].input).product;
            const target = and[i].output.product;
            expect(
              output < target + wiggle && output > target - wiggle
            ).toBeTruthy();
          }
        });
      });
    });
  });

  describe('RNNTimeStep compatibility', () => {
    it('can average error for array,array, counting forwards and backwards', () => {
      const iterations = 50;
      const data = [
        [0.1, 0.2, 0.3, 0.4, 0.5],
        [0.2, 0.3, 0.4, 0.5, 0.6],
        [0.3, 0.4, 0.5, 0.6, 0.7],
        [0.4, 0.5, 0.6, 0.7, 0.8],
        [0.5, 0.6, 0.7, 0.8, 0.9],
      ];

      const net = new LSTMTimeStep({ hiddenLayers: [10] });

      return testTrainer(net, { data, iterations }).then((info) => {
        expect(info.error).toBeLessThan(0.05);
        expect(info.iterations).toBe(iterations);

        for (let i = 0; i < data.length; i++) {
          const value = data[i];
          expect(net.run(value.slice(0, 4)).toFixed(1)).toBe(
            value[4].toFixed(1)
          );
        }
      });
    });
  });
});
