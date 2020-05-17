const RNNTimeStep = require('../../src/recurrent/rnn-time-step');
const RNN = require('../../src/recurrent/rnn');
const LSTMTimeStep = require('../../src/recurrent/lstm-time-step');
const Equation = require('../../src/recurrent/matrix/equation');
const istanbulLinkerUtil = require('../istanbul-linker-util');

// TODO: break out LSTMTimeStep into its own tests

describe('RNNTimeStep', () => {
  describe('getModel', () => {
    test('does not override RNN', () => {
      expect(typeof RNNTimeStep.getModel).toEqual('function');
      expect(RNNTimeStep.getModel).toEqual(RNN.getModel);
    });
  });
  describe('getEquation', () => {
    test('does not override RNN', () => {
      expect(typeof RNNTimeStep.getEquation).toEqual('function');
      expect(RNNTimeStep.getEquation).toEqual(RNN.getEquation);
    });
  });
  describe('.createOutputMatrix()', () => {
    it('creates the outputConnector and output for model', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [9, 11],
        outputSize: 5,
      });
      expect(net.model).toBe(null);
      net.model = {};
      net.createOutputMatrix();
      expect(net.model.outputConnector.rows).toBe(5);
      expect(net.model.outputConnector.columns).toBe(11);
      expect(net.model.output.rows).toBe(5);
      expect(net.model.output.columns).toBe(1);
    });
  });
  describe('.bindEquation()', () => {
    beforeEach(() => {
      jest.spyOn(RNNTimeStep, 'getEquation');
    });
    afterEach(() => {
      RNNTimeStep.getEquation.mockRestore();
    });
    it('calls static getEquation method', () => {
      const net = new RNNTimeStep();
      net.initialize();
      net.bindEquation();
      expect(RNNTimeStep.getEquation).toBeCalled();
    });
    it('adds equations as expected', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [9, 11],
        outputSize: 5,
      });
      net.initialize();
      net.mapModel();
      expect(net.model.equations.length).toBe(0);
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.bindEquation();
      expect(net.model.equations.length).toBe(2);
      net.bindEquation();
      expect(net.model.equations.length).toBe(3);
    });
  });
  describe('.mapModel()', () => {
    describe('when .createHiddenLayers() does not provide model.hiddenLayers', () => {
      it('throws', () => {
        const net = new RNNTimeStep();
        net.createHiddenLayers = () => {};
        net.model = { hiddenLayers: [] };
        expect(() => {
          net.mapModel();
        }).toThrow('net.hiddenLayers not set');
      });
    });
    describe('when .createOutputMatrix() does not provide model.outputConnector', () => {
      it('throws', () => {
        const net = new RNNTimeStep();
        net.createOutputMatrix = () => {};
        net.model = {
          hiddenLayers: [],
          outputConnector: null,
          allMatrices: [],
        };
        expect(() => {
          net.mapModel();
        }).toThrow('net.model.outputConnector');
      });
    });
    describe('when .createOutputMatrix() does not provide model.output', () => {
      it('throws', () => {
        const net = new RNNTimeStep();
        net.createOutputMatrix = () => {};
        net.model = {
          hiddenLayers: [],
          outputConnector: [],
          allMatrices: [],
        };
        expect(() => {
          net.mapModel();
        }).toThrow('net.model.output not set');
      });
    });
    it('maps models to model.allMatrices', () => {
      const net = new RNNTimeStep();
      net.model = {
        allMatrices: [],
        hiddenLayers: [],
      };
      net.mapModel();
      expect(net.model.allMatrices.length).toBe(5);
    });
  });
  describe('.backpropagate()', () => {
    it('steps through model.equations in reverse, calling model.equations[index].backpropagate', () => {
      const net = new RNNTimeStep();
      let i = 0;
      net.model = {
        equations: [
          {
            backpropagate: () => {
              expect(i++).toBe(2);
            },
          },
          {
            backpropagate: () => {
              expect(i++).toBe(1);
            },
          },
          {
            backpropagate: () => {
              expect(i++).toBe(0);
            },
          },
        ],
      };
      net.backpropagate();
      expect(i).toBe(3);
    });
  });
  describe('.run()', () => {
    describe('when this.inputSize = 1', () => {
      describe('when this.outputLookup is truthy', () => {
        it('uses this.runObject as fn, calls it, and sets this.run as it for next use', () => {
          const net = new RNNTimeStep({ inputSize: 1 });
          net.model = { equations: [null] };
          net.outputLookup = {};
          const stub = (net.runObject = jest.fn());
          net.run();
          expect(stub).toBeCalled();
          expect(net.run).toBe(stub);
        });
      });
      describe('when this.outputLookup is not truthy', () => {
        it('calls this.runNumbers and sets this.run as it for next use', () => {
          const net = new RNNTimeStep({ inputSize: 1 });
          net.model = { equations: [null] };
          const stub = (net.runNumbers = jest.fn());
          net.run();
          expect(stub).toBeCalled();
          expect(net.run).toBe(stub);
        });
      });
    });
    describe('when this.inputSize > 1', () => {
      describe('when this.outputLookup is truthy', () => {
        it('calls this.runArrays and sets this.run as it for next use', () => {
          const net = new RNNTimeStep({ inputSize: 2 });
          net.outputLookup = {};
          net.model = { equations: [null] };
          const stub = (net.runObjects = jest.fn());
          net.run();
          expect(stub).toBeCalled();
          expect(net.run).toBe(stub);
        });
      });
      describe('when this.outputLookup is falsey', () => {
        it('calls this.runArrays and sets this.run as it for next use', () => {
          const net = new RNNTimeStep({ inputSize: 2 });
          net.model = { equations: [null] };
          const stub = (net.runArrays = jest.fn());
          net.run();
          expect(stub).toBeCalled();
          expect(net.run).toBe(stub);
        });
      });
    });
  });
  describe('.train()', () => {
    it('throws on array,datum,array w/ inputSize of 2', () => {
      const data = [{ input: [1, 2], output: [3, 4] }];
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 1,
      });
      expect(() => {
        net.train(data);
      }).toThrow();
    });
    it('throws on array,datum,array w/ outputSize of 2', () => {
      const data = [{ input: [1, 2], output: [3, 4] }];
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 2,
      });
      expect(() => {
        net.train(data);
      }).toThrow();
    });
    it('throws on array,datum,object w/ inputSize of 2', () => {
      const data = [{ input: { a: 1, b: 2 }, output: { c: 3, d: 4 } }];
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2,
      });
      expect(() => {
        net.train(data);
      }).toThrow();
    });

    describe('automatically setting inputSize and outputSize', () => {
      describe('numbers', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [[0.1, 0.2, 0.3, 0.4, 0.5]];
          const options = {
            iterations: 0,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.inputSize).toBe(1);
          expect(net.outputSize).toBe(1);
        });
      });
      describe('arrays', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            [
              [0.1, 0.5],
              [0.2, 0.4],
              [0.3, 0.3],
              [0.4, 0.2],
              [0.5, 0.1],
            ],
          ];
          const options = {
            iterations: 1,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.inputSize).toBe(2);
          expect(net.outputSize).toBe(2);
        });
      });
      describe('object', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [{ low: 0.1, med: 0.25, high: 0.5 }];
          const options = {
            iterations: 1,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.inputSize).toBe(1);
          expect(net.outputSize).toBe(1);
        });
      });
      describe('objects', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            [
              { low: 0.1, med: 0.25, high: 0.5 },
              { low: 0.5, med: 0.25, high: 0.1 },
            ],
          ];
          const options = {
            iterations: 1,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.inputSize).toBe(3);
          expect(net.outputSize).toBe(3);
        });
      });
      describe('input/output numbers', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [{ input: [0.1, 0.2, 0.3, 0.4], output: [0.5] }];
          const options = {
            iterations: 1,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.inputSize).toBe(1);
          expect(net.outputSize).toBe(1);
        });
      });
      describe('input/output arrays', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            {
              input: [[0.1, 0.5]],
              output: [[0.5, 0.1]],
            },
          ];
          const options = {
            iterations: 1,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.inputSize).toBe(2);
          expect(net.outputSize).toBe(2);
        });
      });
      describe('input/output object', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            {
              input: { low: 0.1, high: 0.5 },
              output: { low: 0.5, high: 0.1 },
            },
          ];
          const options = {
            iterations: 1,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.inputSize).toBe(1);
          expect(net.outputSize).toBe(1);
        });
      });
      describe('datum', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            {
              input: [{ low: 0.1, high: 0.5 }],
              output: [{ low: 0.5, high: 0.1 }],
            },
          ];
          const options = {
            iterations: 1,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.inputSize).toBe(2);
          expect(net.outputSize).toBe(2);
        });
      });
      it('will not set inputSize & outputSize if already set larger than 1', () => {
        const net = new RNNTimeStep({ inputSize: 99, outputSize: 88 });
        net.initialize = () => {
          throw new Error('got passed size check');
        };
        expect(() => {
          net.train([
            [0, 1, 2, 3, 4],
            [4, 3, 2, 1, 0],
          ]);
        }).toThrow();
        expect(net.inputSize).toBe(99);
        expect(net.outputSize).toBe(88);
      });
    });
    describe('calling using arrays', () => {
      describe('training data with 1D arrays', () => {
        describe('end to end', () => {
          beforeEach(() => {
            jest.spyOn(LSTMTimeStep.prototype, 'trainArrays');
            jest.spyOn(Equation.prototype, 'predictTarget');
          });
          afterEach(() => {
            LSTMTimeStep.prototype.trainArrays.mockRestore();
            Equation.prototype.predictTarget.mockRestore();
          });
          it('uses .runInputNumbers with correct arguments', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [1],
              outputSize: 1,
            });
            const trainingData = [
              [0.1, 0.2, 0.3, 0.4, 0.5],
              [0.5, 0.4, 0.3, 0.2, 0.1],
            ];
            net.train(trainingData, { iterations: 1 });
            expect(LSTMTimeStep.prototype.trainArrays.mock.calls.length).toBe(
              2
            );
            expect(
              LSTMTimeStep.prototype.trainArrays.mock.calls[0].length
            ).toBe(1);
            expect(LSTMTimeStep.prototype.trainArrays.mock.calls[0][0]).toEqual(
              trainingData[0].map((value) => Float32Array.from([value]))
            );
            expect(LSTMTimeStep.prototype.trainArrays.mock.calls[1][0]).toEqual(
              trainingData[1].map((value) => Float32Array.from([value]))
            );
            expect(Equation.prototype.predictTarget.mock.calls.length).toBe(8);
            expect(net.model.equations.length).toBe(5);

            // first array
            expect(Equation.prototype.predictTarget.mock.calls[0][0]).toEqual(
              Float32Array.from([0.1])
            );
            expect(Equation.prototype.predictTarget.mock.calls[0][1]).toEqual(
              Float32Array.from([0.2])
            );

            expect(Equation.prototype.predictTarget.mock.calls[1][0]).toEqual(
              Float32Array.from([0.2])
            );
            expect(Equation.prototype.predictTarget.mock.calls[1][1]).toEqual(
              Float32Array.from([0.3])
            );

            expect(Equation.prototype.predictTarget.mock.calls[2][0]).toEqual(
              Float32Array.from([0.3])
            );
            expect(Equation.prototype.predictTarget.mock.calls[2][1]).toEqual(
              Float32Array.from([0.4])
            );

            expect(Equation.prototype.predictTarget.mock.calls[3][0]).toEqual(
              Float32Array.from([0.4])
            );
            expect(Equation.prototype.predictTarget.mock.calls[3][1]).toEqual(
              Float32Array.from([0.5])
            );

            // second array
            expect(Equation.prototype.predictTarget.mock.calls[4][0]).toEqual(
              Float32Array.from([0.5])
            );
            expect(Equation.prototype.predictTarget.mock.calls[4][1]).toEqual(
              Float32Array.from([0.4])
            );

            expect(Equation.prototype.predictTarget.mock.calls[5][0]).toEqual(
              Float32Array.from([0.4])
            );
            expect(Equation.prototype.predictTarget.mock.calls[5][1]).toEqual(
              Float32Array.from([0.3])
            );

            expect(Equation.prototype.predictTarget.mock.calls[6][0]).toEqual(
              Float32Array.from([0.3])
            );
            expect(Equation.prototype.predictTarget.mock.calls[6][1]).toEqual(
              Float32Array.from([0.2])
            );

            expect(Equation.prototype.predictTarget.mock.calls[7][0]).toEqual(
              Float32Array.from([0.2])
            );
            expect(Equation.prototype.predictTarget.mock.calls[7][1]).toEqual(
              Float32Array.from([0.1])
            );
          });
        });
        it('can learn basic logic', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          const trainingData = [
            [0.1, 0.2, 0.3, 0.4, 0.5],
            [0.5, 0.4, 0.3, 0.2, 0.1],
          ];
          const result = net.train(trainingData, {
            log: true,
            errorThresh: 0.005,
            iterations: 1000,
          });
          expect(result.error).toBeLessThan(0.005);
          expect(result.iterations).toBeLessThan(1000);
          const result1 = net.forecast([0.1, 0.2, 0.3], 2);
          expect(result1[0]).toBeCloseTo(0.4, 1);
          expect(result1[1]).toBeCloseTo(0.5, 1);
          const result2 = net.forecast([0.5, 0.4, 0.3], 2);
          expect(result2[0]).toBeCloseTo(0.2, 1);
          expect(result2[1]).toBeCloseTo(0.1, 1);
        });
      });

      describe('training data with 2D arrays', () => {
        beforeEach(() => {
          jest.spyOn(LSTMTimeStep.prototype, 'trainArrays');
          jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainArrays.mockRestore();
          Equation.prototype.predictTarget.mockRestore();
        });
        it('uses .trainArrays with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [1],
            outputSize: 2,
          });
          const trainingData = [
            [0.1, 0.5],
            [0.2, 0.4],
            [0.3, 0.3],
            [0.4, 0.2],
            [0.5, 0.1],
          ];
          const trainingDataFormatted = trainingData.map((array) =>
            Float32Array.from(array)
          );
          net.train(trainingData, { iterations: 1 });
          expect(LSTMTimeStep.prototype.trainArrays.mock.calls.length).toBe(1);
          expect(LSTMTimeStep.prototype.trainArrays.mock.calls[0].length).toBe(
            1
          );
          expect(LSTMTimeStep.prototype.trainArrays.mock.calls[0][0]).toEqual(
            trainingDataFormatted
          );
          expect(Equation.prototype.predictTarget.mock.calls.length).toBe(4);
          expect(net.model.equations.length).toBe(5);

          // first array
          expect(Equation.prototype.predictTarget.mock.calls[0][0]).toEqual(
            Float32Array.from([0.1, 0.5])
          );
          expect(Equation.prototype.predictTarget.mock.calls[0][1]).toEqual(
            Float32Array.from([0.2, 0.4])
          );

          // second array
          expect(Equation.prototype.predictTarget.mock.calls[1][0]).toEqual(
            Float32Array.from([0.2, 0.4])
          );
          expect(Equation.prototype.predictTarget.mock.calls[1][1]).toEqual(
            Float32Array.from([0.3, 0.3])
          );

          // third array
          expect(Equation.prototype.predictTarget.mock.calls[2][0]).toEqual(
            Float32Array.from([0.3, 0.3])
          );
          expect(Equation.prototype.predictTarget.mock.calls[2][1]).toEqual(
            Float32Array.from([0.4, 0.2])
          );

          // forth array
          expect(Equation.prototype.predictTarget.mock.calls[3][0]).toEqual(
            Float32Array.from([0.4, 0.2])
          );
          expect(Equation.prototype.predictTarget.mock.calls[3][1]).toEqual(
            Float32Array.from([0.5, 0.1])
          );
        });

        it('can learn basic logic', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [20],
            outputSize: 2,
          });
          const trainingData = [
            [0.1, 0.5],
            [0.2, 0.4],
            [0.3, 0.3],
            [0.4, 0.2],
            [0.5, 0.1],
          ];
          const result = net.train(trainingData, { errorThresh: 0.05 });
          expect(result.error).toBeLessThan(0.05);
          expect(result.iterations).toBeLessThan(4000);
        });
      });

      describe('training data with 3D arrays', () => {
        beforeEach(() => {
          jest.spyOn(LSTMTimeStep.prototype, 'trainArrays');
          jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainArrays.mockRestore();
          Equation.prototype.predictTarget.mockRestore();
        });
        it('uses .trainArrays with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [1],
            outputSize: 2,
          });
          const trainingData = [
            [
              [0.1, 0.5],
              [0.2, 0.4],
              [0.3, 0.3],
              [0.4, 0.2],
              [0.5, 0.1],
            ],
            [
              [0.5, 0.9],
              [0.6, 0.8],
              [0.7, 0.7],
              [0.8, 0.6],
              [0.9, 0.5],
            ],
          ];
          const trainingDataFormatted0 = trainingData[0].map((array) =>
            Float32Array.from(array)
          );
          const trainingDataFormatted1 = trainingData[1].map((array) =>
            Float32Array.from(array)
          );

          net.train(trainingData, { iterations: 1 });
          expect(LSTMTimeStep.prototype.trainArrays.mock.calls.length).toBe(2);
          expect(LSTMTimeStep.prototype.trainArrays.mock.calls[0].length).toBe(
            1
          );
          expect(LSTMTimeStep.prototype.trainArrays.mock.calls[0][0]).toEqual(
            trainingDataFormatted0
          );
          expect(LSTMTimeStep.prototype.trainArrays.mock.calls[1][0]).toEqual(
            trainingDataFormatted1
          );
          expect(Equation.prototype.predictTarget.mock.calls.length).toBe(8);
          expect(net.model.equations.length).toBe(5);

          // first set, first array
          expect(Equation.prototype.predictTarget.mock.calls[0][0]).toEqual(
            Float32Array.from([0.1, 0.5])
          );
          expect(Equation.prototype.predictTarget.mock.calls[0][1]).toEqual(
            Float32Array.from([0.2, 0.4])
          );

          // first set, second array
          expect(Equation.prototype.predictTarget.mock.calls[1][0]).toEqual(
            Float32Array.from([0.2, 0.4])
          );
          expect(Equation.prototype.predictTarget.mock.calls[1][1]).toEqual(
            Float32Array.from([0.3, 0.3])
          );

          // first set, third array
          expect(Equation.prototype.predictTarget.mock.calls[2][0]).toEqual(
            Float32Array.from([0.3, 0.3])
          );
          expect(Equation.prototype.predictTarget.mock.calls[2][1]).toEqual(
            Float32Array.from([0.4, 0.2])
          );

          // first set, forth array
          expect(Equation.prototype.predictTarget.mock.calls[3][0]).toEqual(
            Float32Array.from([0.4, 0.2])
          );
          expect(Equation.prototype.predictTarget.mock.calls[3][1]).toEqual(
            Float32Array.from([0.5, 0.1])
          );

          // second set, first array
          expect(Equation.prototype.predictTarget.mock.calls[4][0]).toEqual(
            Float32Array.from([0.5, 0.9])
          );
          expect(Equation.prototype.predictTarget.mock.calls[4][1]).toEqual(
            Float32Array.from([0.6, 0.8])
          );

          // second set, second array
          expect(Equation.prototype.predictTarget.mock.calls[5][0]).toEqual(
            Float32Array.from([0.6, 0.8])
          );
          expect(Equation.prototype.predictTarget.mock.calls[5][1]).toEqual(
            Float32Array.from([0.7, 0.7])
          );

          // second set, third array
          expect(Equation.prototype.predictTarget.mock.calls[6][0]).toEqual(
            Float32Array.from([0.7, 0.7])
          );
          expect(Equation.prototype.predictTarget.mock.calls[6][1]).toEqual(
            Float32Array.from([0.8, 0.6])
          );

          // second set, forth array
          expect(Equation.prototype.predictTarget.mock.calls[7][0]).toEqual(
            Float32Array.from([0.8, 0.6])
          );
          expect(Equation.prototype.predictTarget.mock.calls[7][1]).toEqual(
            Float32Array.from([0.9, 0.5])
          );
        });

        it('can learn basic logic', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [30],
            outputSize: 2,
          });
          const trainingData = [
            [
              [0.1, 0.5],
              [0.2, 0.4],
              [0.3, 0.3],
              [0.4, 0.2],
              [0.5, 0.1],
            ],
            [
              [0.5, 0.9],
              [0.6, 0.8],
              [0.7, 0.7],
              [0.8, 0.6],
              [0.9, 0.5],
            ],
          ];
          const result = net.train(trainingData, { errorThresh: 0.05 });
          expect(result.error).toBeLessThan(0.05);
          expect(result.iterations).toBeLessThan(4000);
        });
      });
    });

    describe('calling using training datum', () => {
      describe('training data with objects', () => {
        beforeEach(() => {
          jest.spyOn(LSTMTimeStep.prototype, 'trainInputOutput');
          jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainInputOutput.mockRestore();
          Equation.prototype.predictTarget.mockRestore();
        });
        it('uses .runInputOutput with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [1],
            outputSize: 1,
          });
          // average temp
          const trainingData = [
            // Washington DC
            {
              input: {
                jan: 42,
                feb: 44,
                mar: 53,
                apr: 64,
              },
              output: {
                may: 75,
                jun: 83,
              },
            },

            // Bluff Utah
            {
              input: {
                jan: 44,
                feb: 52,
                mar: 63,
                apr: 72,
              },
              output: {
                may: 82,
                jun: 92,
              },
            },
          ];
          net.train(trainingData, { iterations: 1 });
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls.length
          ).toBe(2);
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[0].length
          ).toBe(1);
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[0][0]
          ).toEqual({
            input: [42, 44, 53, 64].map((value) => Float32Array.from([value])),
            output: [75, 83].map((value) => Float32Array.from([value])),
          });
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[1][0]
          ).toEqual({
            input: [44, 52, 63, 72].map((value) => Float32Array.from([value])),
            output: [82, 92].map((value) => Float32Array.from([value])),
          });
          expect(Equation.prototype.predictTarget.mock.calls.length).toBe(10);
          expect(net.model.equations.length).toBe(6);

          // first array
          expect(Equation.prototype.predictTarget.mock.calls[0][0]).toEqual(
            new Float32Array([42])
          );
          expect(Equation.prototype.predictTarget.mock.calls[0][1]).toEqual(
            new Float32Array([44])
          );

          expect(Equation.prototype.predictTarget.mock.calls[1][0]).toEqual(
            new Float32Array([44])
          );
          expect(Equation.prototype.predictTarget.mock.calls[1][1]).toEqual(
            new Float32Array([53])
          );

          expect(Equation.prototype.predictTarget.mock.calls[2][0]).toEqual(
            new Float32Array([53])
          );
          expect(Equation.prototype.predictTarget.mock.calls[2][1]).toEqual(
            new Float32Array([64])
          );

          expect(Equation.prototype.predictTarget.mock.calls[3][0]).toEqual(
            new Float32Array([64])
          );
          expect(Equation.prototype.predictTarget.mock.calls[3][1]).toEqual(
            new Float32Array([75])
          );

          expect(Equation.prototype.predictTarget.mock.calls[4][0]).toEqual(
            new Float32Array([75])
          );
          expect(Equation.prototype.predictTarget.mock.calls[4][1]).toEqual(
            new Float32Array([83])
          );

          // second array
          expect(Equation.prototype.predictTarget.mock.calls[5][0]).toEqual(
            new Float32Array([44])
          );
          expect(Equation.prototype.predictTarget.mock.calls[5][1]).toEqual(
            new Float32Array([52])
          );

          expect(Equation.prototype.predictTarget.mock.calls[6][0]).toEqual(
            new Float32Array([52])
          );
          expect(Equation.prototype.predictTarget.mock.calls[6][1]).toEqual(
            new Float32Array([63])
          );

          expect(Equation.prototype.predictTarget.mock.calls[7][0]).toEqual(
            new Float32Array([63])
          );
          expect(Equation.prototype.predictTarget.mock.calls[7][1]).toEqual(
            new Float32Array([72])
          );

          expect(Equation.prototype.predictTarget.mock.calls[8][0]).toEqual(
            new Float32Array([72])
          );
          expect(Equation.prototype.predictTarget.mock.calls[8][1]).toEqual(
            new Float32Array([82])
          );

          expect(Equation.prototype.predictTarget.mock.calls[9][0]).toEqual(
            new Float32Array([82])
          );
          expect(Equation.prototype.predictTarget.mock.calls[9][1]).toEqual(
            new Float32Array([92])
          );
        });
      });
      describe('training data with 1D arrays', () => {
        beforeEach(() => {
          jest.spyOn(LSTMTimeStep.prototype, 'trainInputOutput');
          jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainInputOutput.mockRestore();
          Equation.prototype.predictTarget.mockRestore();
        });
        it('uses .runInputOutput with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [1],
            outputSize: 1,
          });
          const trainingData = [
            { input: [1, 2, 3, 4], output: [5] },
            { input: [5, 4, 3, 2], output: [1] },
          ];
          const trainingDataFormatted0 = {
            input: trainingData[0].input.map((value) =>
              Float32Array.from([value])
            ),
            output: trainingData[0].output.map((value) =>
              Float32Array.from([value])
            ),
          };
          const trainingDataFormatted1 = {
            input: trainingData[1].input.map((value) =>
              Float32Array.from([value])
            ),
            output: trainingData[1].output.map((value) =>
              Float32Array.from([value])
            ),
          };
          net.train(trainingData, { iterations: 1 });
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls.length
          ).toBe(2);
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[0].length
          ).toBe(1);
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[0][0]
          ).toEqual(trainingDataFormatted0);
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[1][0]
          ).toEqual(trainingDataFormatted1);
          expect(Equation.prototype.predictTarget.mock.calls.length).toBe(8);
          expect(net.model.equations.length).toBe(5);

          // first array
          expect(Equation.prototype.predictTarget.mock.calls[0][0]).toEqual(
            Float32Array.from([1])
          );
          expect(Equation.prototype.predictTarget.mock.calls[0][1]).toEqual(
            Float32Array.from([2])
          );

          expect(Equation.prototype.predictTarget.mock.calls[1][0]).toEqual(
            Float32Array.from([2])
          );
          expect(Equation.prototype.predictTarget.mock.calls[1][1]).toEqual(
            Float32Array.from([3])
          );

          expect(Equation.prototype.predictTarget.mock.calls[2][0]).toEqual(
            Float32Array.from([3])
          );
          expect(Equation.prototype.predictTarget.mock.calls[2][1]).toEqual(
            Float32Array.from([4])
          );

          expect(Equation.prototype.predictTarget.mock.calls[3][0]).toEqual(
            Float32Array.from([4])
          );
          expect(Equation.prototype.predictTarget.mock.calls[3][1]).toEqual(
            Float32Array.from([5])
          );

          // second array
          expect(Equation.prototype.predictTarget.mock.calls[4][0]).toEqual(
            Float32Array.from([5])
          );
          expect(Equation.prototype.predictTarget.mock.calls[4][1]).toEqual(
            Float32Array.from([4])
          );

          expect(Equation.prototype.predictTarget.mock.calls[5][0]).toEqual(
            Float32Array.from([4])
          );
          expect(Equation.prototype.predictTarget.mock.calls[5][1]).toEqual(
            Float32Array.from([3])
          );

          expect(Equation.prototype.predictTarget.mock.calls[6][0]).toEqual(
            Float32Array.from([3])
          );
          expect(Equation.prototype.predictTarget.mock.calls[6][1]).toEqual(
            Float32Array.from([2])
          );

          expect(Equation.prototype.predictTarget.mock.calls[7][0]).toEqual(
            Float32Array.from([2])
          );
          expect(Equation.prototype.predictTarget.mock.calls[7][1]).toEqual(
            Float32Array.from([1])
          );
        });
      });

      describe('training data with 2D arrays', () => {
        beforeEach(() => {
          jest.spyOn(LSTMTimeStep.prototype, 'trainInputOutput');
          jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainInputOutput.mockRestore();
          Equation.prototype.predictTarget.mockRestore();
        });
        it('uses .runInputOutputArray with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [1],
            outputSize: 2,
          });
          const trainingData = [
            {
              input: [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
              ],
              output: [[0.5, 0.1]],
            },
            {
              input: [
                [0.5, 0.9],
                [0.6, 0.8],
                [0.7, 0.7],
                [0.8, 0.6],
              ],
              output: [[0.9, 0.5]],
            },
          ];
          const trainingDataFormatted0 = {
            input: trainingData[0].input.map((value) =>
              Float32Array.from(value)
            ),
            output: trainingData[0].output.map((value) =>
              Float32Array.from(value)
            ),
          };
          const trainingDataFormatted1 = {
            input: trainingData[1].input.map((value) =>
              Float32Array.from(value)
            ),
            output: trainingData[1].output.map((value) =>
              Float32Array.from(value)
            ),
          };
          net.train(trainingData, { iterations: 1 });
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls.length
          ).toBe(2);
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[0].length
          ).toBe(1);
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[0][0]
          ).toEqual(trainingDataFormatted0);
          expect(
            LSTMTimeStep.prototype.trainInputOutput.mock.calls[1][0]
          ).toEqual(trainingDataFormatted1);
          expect(Equation.prototype.predictTarget.mock.calls.length).toBe(8);
          expect(net.model.equations.length).toBe(5);

          // first set, first array
          expect(Equation.prototype.predictTarget.mock.calls[0][0]).toEqual(
            Float32Array.from([0.1, 0.5])
          );
          expect(Equation.prototype.predictTarget.mock.calls[0][1]).toEqual(
            Float32Array.from([0.2, 0.4])
          );

          // first set, second array
          expect(Equation.prototype.predictTarget.mock.calls[1][0]).toEqual(
            Float32Array.from([0.2, 0.4])
          );
          expect(Equation.prototype.predictTarget.mock.calls[1][1]).toEqual(
            Float32Array.from([0.3, 0.3])
          );

          // first set, third array
          expect(Equation.prototype.predictTarget.mock.calls[2][0]).toEqual(
            Float32Array.from([0.3, 0.3])
          );
          expect(Equation.prototype.predictTarget.mock.calls[2][1]).toEqual(
            Float32Array.from([0.4, 0.2])
          );

          // first set, forth array
          expect(Equation.prototype.predictTarget.mock.calls[3][0]).toEqual(
            Float32Array.from([0.4, 0.2])
          );
          expect(Equation.prototype.predictTarget.mock.calls[3][1]).toEqual(
            Float32Array.from([0.5, 0.1])
          );

          // second set, first array
          expect(Equation.prototype.predictTarget.mock.calls[4][0]).toEqual(
            Float32Array.from([0.5, 0.9])
          );
          expect(Equation.prototype.predictTarget.mock.calls[4][1]).toEqual(
            Float32Array.from([0.6, 0.8])
          );

          // second set, second array
          expect(Equation.prototype.predictTarget.mock.calls[5][0]).toEqual(
            Float32Array.from([0.6, 0.8])
          );
          expect(Equation.prototype.predictTarget.mock.calls[5][1]).toEqual(
            Float32Array.from([0.7, 0.7])
          );

          // second set, third array
          expect(Equation.prototype.predictTarget.mock.calls[6][0]).toEqual(
            Float32Array.from([0.7, 0.7])
          );
          expect(Equation.prototype.predictTarget.mock.calls[6][1]).toEqual(
            Float32Array.from([0.8, 0.6])
          );

          // second set, forth array
          expect(Equation.prototype.predictTarget.mock.calls[7][0]).toEqual(
            Float32Array.from([0.8, 0.6])
          );
          expect(Equation.prototype.predictTarget.mock.calls[7][1]).toEqual(
            Float32Array.from([0.9, 0.5])
          );
        });
      });
    });

    describe('prediction using arrays', () => {
      it('can train and predict linear numeric, single input, 1 to 5, and 5 to 1', () => {
        const net = new LSTMTimeStep({
          inputSize: 1,
          hiddenLayers: [20, 20],
          outputSize: 1,
        });

        const trainingData = [
          [0.1, 0.2, 0.3, 0.4, 0.5],
          [0.5, 0.4, 0.3, 0.2, 0.1],
        ];

        const result = net.train(trainingData);
        expect(result.error).toBeLessThan(0.05);
        const closeToFive = net.run([0.1, 0.2, 0.3, 0.4]);
        const closeToOne = net.run([0.5, 0.4, 0.3, 0.2]);
        expect(closeToOne.toFixed(1)).toBe('0.1');
        expect(closeToFive.toFixed(1)).toBe('0.5');
      });
      it('can train and predict single linear array, two input, 1 to 5, and 5 to 1', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [20],
          outputSize: 2,
        });

        // Same test as previous, but combined on a single set
        const trainingData = [
          [0.1, 0.5],
          [0.2, 0.4],
          [0.3, 0.3],
          [0.4, 0.2],
          [0.5, 0.1],
        ];

        const result = net.train(trainingData, {
          errorThresh: 0.01,
        });
        expect(result.error).toBeLessThan(0.01);
        const closeToFiveAndOne = net.run([
          [0.1, 0.5],
          [0.2, 0.4],
          [0.3, 0.3],
          [0.4, 0.2],
        ]);
        expect(closeToFiveAndOne[0].toFixed(1)).toBe('0.5');
        expect(closeToFiveAndOne[1].toFixed(1)).toBe('0.1');
      });
      it('can train and predict multiple linear array, two input, 1 to 5, 5 to 1, 5 to 9, and 9 to 5', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [40],
          outputSize: 2,
        });

        // Same test as previous, but combined on a single set
        const trainingData = [
          [
            [0.1, 0.5],
            [0.2, 0.4],
            [0.3, 0.3],
            [0.4, 0.2],
            [0.5, 0.1],
          ],
          [
            [0.5, 0.9],
            [0.6, 0.8],
            [0.7, 0.7],
            [0.8, 0.6],
            [0.9, 0.5],
          ],
        ];

        const result = net.train(trainingData);
        expect(result.error).toBeLessThan(0.05);
        const closeToFiveAndOne = net.run([
          [0.1, 0.5],
          [0.2, 0.4],
          [0.3, 0.3],
          [0.4, 0.2],
        ]);
        expect(closeToFiveAndOne[0].toFixed(1)).toBe('0.5');
        expect(closeToFiveAndOne[1].toFixed(1)).toBe('0.1');
        const closeToNineAndFive = net.run([
          [0.5, 0.9],
          [0.6, 0.8],
          [0.7, 0.7],
          [0.8, 0.6],
        ]);
        expect(closeToNineAndFive[0].toFixed(1)).toBe('0.9');
        expect(closeToNineAndFive[1].toFixed(1)).toBe('0.5');
      });
    });

    describe('prediction using input/output', () => {
      describe('with objects', () => {
        it('can train and predict input/output linear array avg weather data', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [5],
            outputSize: 1,
          });

          // average temp
          const trainingData = [
            // Washington DC
            {
              input: {
                jan: 0.42,
                feb: 0.44,
                mar: 0.53,
                apr: 0.64,
              },
              output: {
                may: 0.75,
                jun: 0.83,
              },
            },

            // Bluff Utah
            {
              input: {
                jan: 0.44,
                feb: 0.52,
                mar: 0.63,
                apr: 0.72,
              },
              output: {
                may: 0.82,
                jun: 0.92,
              },
            },
          ];

          const result = net.train(trainingData);
          expect(result.error).toBeLessThan(0.05);
          const washington = net.run({
            jan: 0.42,
            feb: 0.44,
            mar: 0.53,
            apr: 0.64,
          });
          const bluff = net.run({ jan: 0.44, feb: 0.52, mar: 0.63, apr: 0.72 });
          expect(washington.may.toFixed(2).indexOf('0.7')).toBeGreaterThan(-1);
          expect(washington.jun.toFixed(2).indexOf('0.8')).toBeGreaterThan(-1);

          expect(bluff.may.toFixed(2).indexOf('0.8')).toBeGreaterThan(-1);
          expect(bluff.jun.toFixed(2).indexOf('0.9')).toBeGreaterThan(-1);
        });
      });

      describe('with arrays', () => {
        it('can use inputs(4) and output(1)', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [20, 20],
            outputSize: 1,
          });

          // Same test as previous, but combined on a single set
          const trainingData = [
            {
              input: [0.1, 0.2, 0.3, 0.4],
              output: [0.5],
            },
            {
              input: [0.5, 0.4, 0.3, 0.2],
              output: [0.1],
            },
          ];

          const result = net.train(trainingData);
          expect(result.error).toBeLessThan(0.09);
          const closeToFive = net.run([0.1, 0.2, 0.3, 0.4]);
          const closeToOne = net.run([0.5, 0.4, 0.3, 0.2]);
          expect(closeToFive.toFixed(1)).toBe('0.5');
          expect(closeToOne.toFixed(1)).toBe('0.1');
        });
        it('can train and predict using array of input and output, two input, 1 to 5, and 5 to 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [20],
            outputSize: 2,
          });

          // Same test as previous, but combined on a single set
          const trainingData = [
            {
              input: [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
              ],
              output: [[0.5, 0.1]],
            },
          ];

          const result = net.train(trainingData, { errorThresh: 0.01 });
          expect(result.error).toBeLessThan(0.01);
          const closeToFiveAndOne = net.run([
            [0.1, 0.5],
            [0.2, 0.4],
            [0.3, 0.3],
            [0.4, 0.2],
          ]);
          expect(closeToFiveAndOne[0].toFixed(1)).toBe('0.5');
          expect(closeToFiveAndOne[1].toFixed(1)).toBe('0.1');
        });
      });
    });
  });
  describe('.trainNumbers()', () => {
    function prepNet(net) {
      // put some weights into recurrent inputs
      net.initialLayerInputs.forEach(
        (matrix) => (matrix.weights = matrix.weights.map(() => 1))
      );
      net.model.equationConnections.forEach(
        (matrix) => (matrix[0].weights = matrix[0].weights.map(() => 1))
      );

      // make any values that are less than zero, positive, so relu doesn't go into zero
      net.model.equations.forEach((equation) =>
        equation.states.forEach((state) => {
          if (state.left)
            state.left.weights = state.left.weights.map((value) =>
              value < 0 ? Math.abs(value) : value
            );
          if (state.right)
            state.right.weights = state.right.weights.map((value) =>
              value < 0 ? Math.abs(value) : value
            );
        })
      );
    }
    it('forward propagates weights', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });

      net.initialize();
      // 1,2
      net.bindEquation();
      // 2,3
      net.bindEquation();
      // end
      net.bindEquation();

      net.model.equations.forEach((equation, equationIndex) => {
        // we back propagate zero, so don't check there
        if (equationIndex > 1) return;
        equation.states.forEach((state) => {
          // don't use equation connections, they are zero;
          if (net.model.equationConnections.indexOf(state.product) > -1) return;
          // don't use initialLayerInputs, zero there too
          if (state.right === net.initialLayerInputs[0]) return;
          state.product.weights.forEach((weight) => {
            expect(weight).toBe(0);
          });
        });
      });

      prepNet(net);

      net.trainNumbers([1, 2, 3]);

      net.model.equations.forEach((equation, equationIndex) => {
        // we back propagate zero, so don't check last equation, as it has zeros
        if (equationIndex > 1) return;
        equation.states.forEach((state) => {
          for (
            let weightIndex = 0;
            weightIndex < state.product.weights.length;
            weightIndex++
          ) {
            const weight = state.product.weights[weightIndex];
            expect(weight).not.toBe(0);
          }
        });
      });
    });
    it('back propagates deltas', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });

      net.initialize();
      // 1,2
      net.bindEquation();
      // 2,3
      net.bindEquation();
      // end
      net.bindEquation();

      net.model.equations.forEach((equation, equationIndex) => {
        // we back propagate zero, so don't check there
        if (equationIndex > 1) return;
        equation.states.forEach((state) => {
          // don't use equation connections, they are zero;
          if (net.model.equationConnections.indexOf(state.product) > -1) return;
          // don't use initialLayerInputs, zero there too
          if (state.right === net.initialLayerInputs[0]) return;
          state.product.weights.forEach((weight) => {
            expect(weight).toBe(0);
          });
        });
      });

      prepNet(net);

      net.model.equations.forEach((equation, equationIndex) => {
        // we back propagate zero, so don't check last equation, as it has zeros
        if (equationIndex > 1) return;
        equation.states.forEach((state) => {
          state.product.deltas.forEach((delta) => {
            expect(delta).toBe(0);
          });
        });
      });

      net.trainNumbers([[1], [2], [3]]);
      net.backpropagate();

      net.model.equations.forEach((equation, equationIndex) => {
        // we back propagate zero, so don't check last equation, as it has zeros
        if (equationIndex > 1) return;
        equation.states.forEach((state) => {
          state.product.deltas.forEach((delta) => {
            expect(delta).not.toBe(0);
          });
        });
      });
    });
    it('creates the correct size equations', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [20],
        outputSize: 1,
      });

      net.initialize();
      net.bindEquation();
      net.trainNumbers([1, 2, 0]);
      expect(net.model.equations.length).toBe(3);
    });
    it('copies weights to deltas on end of equation', (done) => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [20],
        outputSize: 1,
      });

      net.initialize();
      net.bindEquation();
      net.bindEquation();
      expect(net.model.equations.length).toBe(2);
      const equationOutput0 =
        net.model.equations[0].states[net.model.equations[0].states.length - 1];
      const equationOutput1 =
        net.model.equations[1].states[net.model.equations[1].states.length - 1];
      const originalDeltas0 = equationOutput0.product.deltas.slice(0);
      const originalDeltas1 = equationOutput1.product.deltas.slice(0);
      net.trainNumbers([1, 2, 1]);
      expect(net.model.equations.length).toBe(3);
      expect(originalDeltas0).not.toEqual(equationOutput0.product.deltas);
      expect(originalDeltas1).not.toEqual(equationOutput1.product.deltas);
      expect(equationOutput0.product.deltas).not.toEqual(
        equationOutput1.product.deltas
      );
      done();
    });
  });
  describe('.runNumbers()', () => {
    it('returns null when this.isRunnable returns false', () => {
      const result = RNNTimeStep.prototype.runNumbers.apply({
        isRunnable: false,
      });
      expect(result).toBe(null);
    });
    it('sets up equations for length of input plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.runNumbers([1, 2, 3]);
      expect(net.model.equations.length).toBe(4);
    });
    it('sets calls equation.runInput() with value in array for each input plus 1 for 0 (to end) output', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      const runInputStubs = [];
      net.bindEquation = function () {
        const stub = jest.fn(() => {
          return { weights: [] };
        });
        runInputStubs.push(stub);
        this.model.equations.push({ runInput: stub });
      };
      net.bindEquation();
      net.runNumbers([1, 2, 3]);
      expect(runInputStubs.length).toBe(4);
      expect(runInputStubs[0]).toBeCalled();
      expect(runInputStubs[1]).toBeCalled();
      expect(runInputStubs[2]).toBeCalled();
      expect(runInputStubs[3]).toBeCalled();

      expect(runInputStubs[0].mock.calls[0][0]).toEqual([1]);
      expect(runInputStubs[1].mock.calls[0][0]).toEqual([2]);
      expect(runInputStubs[2].mock.calls[0][0]).toEqual([3]);
      expect(runInputStubs[3].mock.calls[0][0]).toEqual(new Float32Array([0]));
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      const stub = (net.end = jest.fn());
      net.initialize();
      net.bindEquation();
      net.runNumbers([1, 2, 3]);
      expect(stub).toBeCalled();
    });
  });
  describe('.forecastNumbers()', () => {
    it('returns null when this.isRunnable returns false', () => {
      const result = RNNTimeStep.prototype.forecastNumbers.apply({
        isRunnable: false,
      });
      expect(result).toBe(null);
    });
    it('sets up equations for length of input plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.forecastNumbers([1, 2, 3], 2);
      expect(net.model.equations.length).toBe(6);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      const stub = (net.end = jest.fn());
      net.initialize();
      net.bindEquation();
      net.forecastNumbers([1, 2, 3], 2);
      expect(stub).toBeCalled();
    });
    it('outputs the length of required forecast', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      net.bindEquation();
      const result = net.forecastNumbers([1, 2, 3], 2);
      expect(result.length).toBe(2);
    });
    it('outputs a flat array of numbers', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      net.bindEquation();
      const result = net.forecastNumbers([1, 2, 3], 2);
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('number');
    });
  });
  describe('.runObject()', () => {
    it('calls this.forecastNumbers()', () => {
      const forecastNumbersStub = jest.fn(() => [99, 88]);
      const result = RNNTimeStep.prototype.runObject.apply(
        {
          inputLookup: {
            input1: 0,
            input2: 1,
          },
          outputLookup: {
            output1: 0,
            output2: 1,
          },
          forecastNumbers: forecastNumbersStub,
        },
        [1, 2]
      );

      expect(result).toEqual({
        output1: 99,
        output2: 88,
      });
      expect(forecastNumbersStub).toBeCalled();
    });
    it('handles object to object with lookup tables being same w/ inputSize of 1', () => {
      const inputSize = 1;
      const hiddenLayers = [10];
      const outputSize = 1;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let lastStatus;
      net.train(
        [{ monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 }],
        {
          log: (status) => {
            lastStatus = status;
          },
        }
      );
      const result = net.run({
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
      });
      expect(Object.keys(result).length).toBe(1);
      expect(result.friday.toFixed(0)).toBe('5');
    });
  });
  describe('.forecastObjects()', () => {
    it('maps values correctly', () => {
      const forecastArrays = (input, count) => {
        expect(count).toBe(2);
        return [
          [0.8, 0.7],
          [0.6, 0.5],
        ];
      };
      const instance = {
        inputLookup: { low: 0, high: 1 },
        inputLookupLength: 2,
        outputLookup: { low: 0, high: 1 },
        outputLookupLength: 2,
        forecastArrays,
      };
      const input = [
        { low: 0.1, high: 0.9 },
        { low: 0.1, high: 0.9 },
        { low: 0.1, high: 0.9 },
      ];
      const result = RNNTimeStep.prototype.forecastObjects.apply(instance, [
        input,
        2,
      ]);
      expect(result).toEqual([
        { low: 0.8, high: 0.7 },
        { low: 0.6, high: 0.5 },
      ]);
    });
  });
  describe('.trainInputOutput()', () => {
    it('sets up equations for length of input(3), output(1) plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.trainInputOutput({ input: [1, 2, 3], output: [4] });
      expect(net.model.equations.length).toBe(4);
    });
    it('sets up equations for length of input(3), output(2) plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.trainInputOutput({ input: [1, 2, 3], output: [4, 5] });
      expect(net.model.equations.length).toBe(5);
    });
    it('calls equation.predictTarget for each input', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      const predictTargetStubs = [];
      const runInputStubs = [];
      net.bindEquation = function () {
        const predictTargetStub = jest.fn();
        const runInputStub = jest.fn();
        predictTargetStubs.push(predictTargetStub);
        runInputStubs.push(runInputStub);
        this.model.equations.push({
          predictTarget: predictTargetStub,
          runInput: runInputStub,
        });
      };
      expect(net.model.equations.length).toBe(0);
      const data = net.formatData([{ input: [1, 2, 3], output: [4, 5] }]);
      net.trainInputOutput(data[0]);
      expect(net.model.equations.length).toBe(5);

      expect(runInputStubs[0]).not.toBeCalled();
      expect(runInputStubs[1]).not.toBeCalled();
      expect(runInputStubs[2]).not.toBeCalled();
      expect(runInputStubs[3]).not.toBeCalled();

      expect(predictTargetStubs[0]).toBeCalled();
      expect(predictTargetStubs[1]).toBeCalled();
      expect(predictTargetStubs[2]).toBeCalled();
      expect(predictTargetStubs[3]).toBeCalled();
      expect(runInputStubs[4]).toBeCalled();

      expect(predictTargetStubs[0].mock.calls[0]).toEqual([
        new Float32Array([1]),
        new Float32Array([2]),
      ]);
      expect(predictTargetStubs[1].mock.calls[0]).toEqual([
        new Float32Array([2]),
        new Float32Array([3]),
      ]);
      expect(predictTargetStubs[2].mock.calls[0]).toEqual([
        new Float32Array([3]),
        new Float32Array([4]),
      ]);
      expect(predictTargetStubs[3].mock.calls[0]).toEqual([
        new Float32Array([4]),
        new Float32Array([5]),
      ]);
      expect(runInputStubs[4].mock.calls[0]).toEqual([new Float32Array([0])]);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      const stub = (net.end = jest.fn());
      net.initialize();
      net.bindEquation();
      net.trainInputOutput({ input: [1, 2, 3], output: [4, 5] });
      expect(stub).toBeCalled();
    });
  });
  describe('.trainArrays()', () => {
    it('sets up equations for length of input(3), output(1) plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.trainArrays([
        [1, 4],
        [2, 3],
        [3, 2],
        [4, 1],
      ]);
      expect(net.model.equations.length).toBe(4);
    });
    it('sets up equations for length of input(3), output(2) plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.trainArrays([
        [1, 5],
        [2, 4],
        [3, 3],
        [4, 2],
        [5, 1],
      ]);
      expect(net.model.equations.length).toBe(5);
    });
    it('calls equation.predictTarget for each input', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      const predictTargetStubs = [];
      const runInputStubs = [];
      net.bindEquation = function () {
        const predictTargetStub = jest.fn();
        const runInputStub = jest.fn();
        predictTargetStubs.push(predictTargetStub);
        runInputStubs.push(runInputStub);
        this.model.equations.push({
          predictTarget: predictTargetStub,
          runInput: runInputStub,
        });
      };
      expect(net.model.equations.length).toBe(0);
      net.trainArrays([
        [1, 5],
        [2, 4],
        [3, 3],
        [4, 2],
        [5, 1],
      ]);
      expect(net.model.equations.length).toBe(5);

      expect(runInputStubs[0]).not.toBeCalled();
      expect(runInputStubs[1]).not.toBeCalled();
      expect(runInputStubs[2]).not.toBeCalled();
      expect(runInputStubs[3]).not.toBeCalled();

      expect(predictTargetStubs[0]).toBeCalled();
      expect(predictTargetStubs[1]).toBeCalled();
      expect(predictTargetStubs[2]).toBeCalled();
      expect(predictTargetStubs[3]).toBeCalled();
      expect(runInputStubs[4]).toBeCalled();

      expect(predictTargetStubs[0].mock.calls[0]).toEqual([
        [1, 5],
        [2, 4],
      ]);
      expect(predictTargetStubs[1].mock.calls[0]).toEqual([
        [2, 4],
        [3, 3],
      ]);
      expect(predictTargetStubs[2].mock.calls[0]).toEqual([
        [3, 3],
        [4, 2],
      ]);
      expect(predictTargetStubs[3].mock.calls[0]).toEqual([
        [4, 2],
        [5, 1],
      ]);
      expect(runInputStubs[4].mock.calls[0]).toEqual([new Float32Array([0])]);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2,
      });
      const stub = (net.end = jest.fn());
      net.initialize();
      net.bindEquation();
      net.trainArrays([
        [1, 5],
        [2, 4],
        [3, 3],
        [4, 2],
        [5, 1],
      ]);
      expect(stub).toBeCalled();
    });
  });
  describe('.runArrays()', () => {
    it('returns null when this.isRunnable returns false', () => {
      const result = RNNTimeStep.prototype.runArrays.apply({
        isRunnable: false,
      });
      expect(result).toBe(null);
    });
    it('sets up equations for length of input plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.runArrays([
        [1, 3],
        [2, 2],
        [3, 1],
      ]);
      expect(net.model.equations.length).toBe(4);
    });
    it('sets calls equation.runInput() with value in array for each input plus 1 for 0 (to end) output', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2,
      });
      net.initialize();
      const runInputStubs = [];
      net.bindEquation = function () {
        const stub = jest.fn(() => {
          return { weights: [] };
        });
        runInputStubs.push(stub);
        this.model.equations.push({ runInput: stub });
      };
      net.bindEquation();
      net.runArrays([
        [1, 3],
        [2, 2],
        [3, 1],
      ]);
      expect(runInputStubs.length).toBe(4);
      expect(runInputStubs[0]).toBeCalled();
      expect(runInputStubs[1]).toBeCalled();
      expect(runInputStubs[2]).toBeCalled();
      expect(runInputStubs[3]).toBeCalled();

      expect(runInputStubs[0].mock.calls[0][0]).toEqual([1, 3]);
      expect(runInputStubs[1].mock.calls[0][0]).toEqual([2, 2]);
      expect(runInputStubs[2].mock.calls[0][0]).toEqual([3, 1]);
      expect(runInputStubs[3].mock.calls[0][0]).toEqual(
        new Float32Array([0, 0])
      );
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2,
      });
      const stub = (net.end = jest.fn());
      net.initialize();
      net.bindEquation();
      net.runArrays([
        [1, 3],
        [2, 2],
        [3, 1],
      ]);
      expect(stub).toBeCalled();
    });
  });
  describe('.forecastArrays()', () => {
    it('returns null when this.isRunnable returns false', () => {
      const result = RNNTimeStep.prototype.forecastArrays.apply({
        isRunnable: false,
      });
      expect(result).toBe(null);
    });
    it('sets up equations for length of input plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.forecastArrays(
        [
          [1, 3],
          [2, 2],
          [3, 1],
        ],
        2
      );
      expect(net.model.equations.length).toBe(6);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      const stub = (net.end = jest.fn());
      net.initialize();
      net.bindEquation();
      net.forecastArrays(
        [
          [1, 3],
          [2, 2],
          [3, 1],
        ],
        2
      );
      expect(stub).toBeCalled();
    });
    it('outputs the length of required forecast', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1,
      });
      net.initialize();
      net.bindEquation();
      const result = net.forecastArrays(
        [
          [1, 3],
          [2, 2],
          [3, 1],
        ],
        2
      );
      expect(result.length).toBe(2);
    });
    it('outputs a nested array of numbers', () => {
      const outputWidth = 4;
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: outputWidth,
      });
      net.initialize();
      net.bindEquation();
      const predictionsCount = 3;
      const result = net.forecastArrays(
        [
          [1, 3],
          [2, 2],
          [3, 1],
        ],
        predictionsCount
      );
      expect(result.length).toBe(predictionsCount);
      expect(result[0].length).toBe(outputWidth);
      expect(result[1].length).toBe(outputWidth);
      expect(result[2].length).toBe(outputWidth);
      expect(typeof result[0][0]).toBe('number');
      expect(typeof result[0][1]).toBe('number');
      expect(typeof result[0][2]).toBe('number');
      expect(typeof result[0][3]).toBe('number');
      expect(typeof result[1][0]).toBe('number');
      expect(typeof result[1][1]).toBe('number');
      expect(typeof result[1][2]).toBe('number');
      expect(typeof result[1][3]).toBe('number');
      expect(typeof result[2][0]).toBe('number');
      expect(typeof result[2][1]).toBe('number');
      expect(typeof result[2][2]).toBe('number');
      expect(typeof result[2][3]).toBe('number');
    });
  });
  describe('.forecast()', () => {
    describe('when this.inputSize = 1', () => {
      it('calls this.forecastNumbers and sets this.forecast as it for next use', () => {
        const net = new RNNTimeStep({ inputSize: 1 });
        net.model = { equations: [null] };
        const stub = (net.forecastNumbers = jest.fn());
        net.forecast();
        expect(stub).toBeCalled();
        expect(net.forecast).toBe(stub);
      });
    });
    describe('when this.inputSize > 1', () => {
      it('calls this.forecastArrays and sets this.forecast as it for next use', () => {
        const net = new RNNTimeStep({ inputSize: 2 });
        net.model = { equations: [null] };
        const stub = (net.forecastArrays = jest.fn());
        net.forecast();
        expect(stub).toBeCalled();
        expect(net.forecast).toEqual(stub);
      });
    });
    describe('using numbers', () => {
      it('can use an input of numbers of length 3 and give an output of length 2', () => {
        const net = new LSTMTimeStep({
          inputSize: 1,
          hiddenLayers: [10],
          outputSize: 1,
        });

        // Same test as previous, but combined on a single set
        const trainingData = [
          {
            input: [0.1, 0.2, 0.3],
            output: [0.4, 0.5],
          },
          {
            input: [0.5, 0.4, 0.3],
            output: [0.2, 0.1],
          },
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.01 });
        expect(trainResult.error).toBeLessThan(0.01);
        const result1 = net.forecast([0.1, 0.2, 0.3], 2);
        expect(result1.length).toBe(2);
        expect(result1[0].toFixed(1)).toBe('0.4');
        expect(result1[1].toFixed(1)).toBe('0.5');

        const result2 = net.forecast([0.5, 0.4, 0.3], 2);
        expect(result2.length).toBe(2);
        expect(result2[0].toFixed(1)).toBe('0.2');
        expect(result2[1].toFixed(1)).toBe('0.1');
      });
    });
    describe('using arrays', () => {
      it('can use an input array of length 3 and give an output of length 2', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [20],
          outputSize: 2,
        });

        // Same test as previous, but combined on a single set
        const trainingData = [
          {
            input: [
              [0.1, 0.5],
              [0.2, 0.4],
              [0.3, 0.3],
            ],
            output: [
              [0.4, 0.2],
              [0.5, 0.1],
            ],
          },
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.01 });
        expect(trainResult.error).toBeLessThan(0.01);
        const result = net.forecast(
          [
            [0.1, 0.5],
            [0.2, 0.4],
            [0.3, 0.3],
          ],
          2
        );
        expect(result.length).toBe(2);
        expect(result[0][0].toFixed(1)).toBe('0.4');
        expect(result[0][1].toFixed(1)).toBe('0.2');
        expect(result[1][0].toFixed(1)).toBe('0.5');
        expect(result[1][1].toFixed(1)).toBe('0.1');
      });
    });
    describe('using object', () => {
      it('can use an input object of 3 keys and give an output of 2 keys', () => {
        const net = new LSTMTimeStep({
          inputSize: 1,
          hiddenLayers: [20],
          outputSize: 1,
        });

        const trainingData = [
          {
            input: { monday: 0.1, tuesday: 0.2, wednesday: 0.3, thursday: 0.3 },
            output: { friday: 0.4, saturday: 0.5 },
          },
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.01 });
        expect(trainResult.error).toBeLessThan(0.01);
        const result = net.forecast(
          { monday: 0.1, tuesday: 0.2, wednesday: 0.3, thursday: 0.3 },
          2
        );
        expect(Object.keys(result).length).toBe(2);
        expect(result.friday.toFixed(1)).toBe('0.4');
        expect(result.saturday.toFixed(1)).toBe('0.5');
      });
    });
    describe('using objects', () => {
      it('can use an input array of length 3 and give an output of length 2', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [20],
          outputSize: 2,
        });

        // Same test as previous, but combined on a single set
        const trainingData = [
          {
            input: [
              { low: 0.1, high: 0.5 },
              { low: 0.2, high: 0.4 },
              { low: 0.3, high: 0.3 },
            ],
            output: [
              { low: 0.4, high: 0.2 },
              { low: 0.5, high: 0.1 },
            ],
          },
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.01 });
        expect(trainResult.error).toBeLessThan(0.01);
        const result = net.forecast(
          [
            { low: 0.1, high: 0.5 },
            { low: 0.2, high: 0.4 },
            { low: 0.3, high: 0.3 },
          ],
          2
        );
        expect(result.length).toBe(2);
        expect(result[0].low.toFixed(1)).toBe('0.4');
        expect(result[0].high.toFixed(1)).toBe('0.2');
        expect(result[1].low.toFixed(1)).toBe('0.5');
        expect(result[1].high.toFixed(1)).toBe('0.1');
      });
    });
  });
  describe('.formatData()', () => {
    describe('handles datum', () => {
      it('throws array,datum,object in inputSize > 1', () => {
        const data = [
          { input: { one: 1, two: 2 }, output: { three: 3, four: 4 } },
        ];
        const instance = { inputSize: 2, outputSize: 1 };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('throws array,datum,object in inputSize > 1', () => {
        const data = [
          { input: { one: 1, two: 2 }, output: { three: 3, four: 4 } },
        ];
        const instance = { inputSize: 1, outputSize: 2 };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('handles array,datum,object to array,datum,array,array w/ inputSize of 1', () => {
        const data = [
          { input: { one: 1, two: 2 }, output: { three: 3, four: 4 } },
        ];
        const instance = { inputSize: 1, outputSize: 1 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        expect(result).toEqual([
          {
            input: [Float32Array.from([1]), Float32Array.from([2])],
            output: [Float32Array.from([3]), Float32Array.from([4])],
          },
        ]);
      });
      it('throws with array,datum,array', () => {
        const data = [{ input: [1, 2], output: [3, 4] }];
        const instance = {};
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('throws with array,datum,object', () => {
        const data = [{ input: { a: 1, b: 2 }, output: { c: 3, d: 4 } }];
        const instance = { inputSize: 2 };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('throws if array,datum,array,array not sized to match inputSize', () => {
        const data = [{ input: [[1, 4, 5]], output: [[3, 2]] }];
        const instance = {
          inputSize: 2,
          outputSize: 2,
        };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('throws if array,datum,array,array not sized to match outputSize', () => {
        const data = [{ input: [[1, 4]], output: [[3, 2, 1]] }];
        const instance = {
          inputSize: 2,
          outputSize: 2,
        };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('formats array,datum,array,array to array,datum,array,floatArray', () => {
        const data = [
          {
            input: [
              [1, 4],
              [2, 3],
            ],
            output: [
              [3, 2],
              [4, 1],
            ],
          },
        ];
        const instance = {
          inputSize: 2,
          outputSize: 2,
        };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        expect(result).toEqual([
          {
            input: [Float32Array.from([1, 4]), Float32Array.from([2, 3])],
            output: [Float32Array.from([3, 2]), Float32Array.from([4, 1])],
          },
        ]);
      });
      it('formats array,datum,array,object to array,datum,array,floatArray', () => {
        const data = [
          {
            input: [
              { a: 1, b: 4 },
              { a: 2, b: 3 },
            ],
            output: [
              { c: 3, d: 2 },
              { c: 4, d: 1 },
            ],
          },
        ];
        const instance = {
          inputSize: 2,
        };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        expect(JSON.stringify(instance.inputLookup)).toBe('{"a":0,"b":1}');
        expect(JSON.stringify(instance.outputLookup)).toBe('{"c":0,"d":1}');
        expect(instance.inputLookupLength).toBe(2);
        expect(instance.outputLookupLength).toBe(2);
        expect(result).toEqual([
          {
            input: [Float32Array.from([1, 4]), Float32Array.from([2, 3])],
            output: [Float32Array.from([3, 2]), Float32Array.from([4, 1])],
          },
        ]);
      });
    });
    describe('arrays', () => {
      it('throws is inputSize > 1', () => {
        const data = [1, 2, 3, 4];
        const instance = { inputSize: 2, outputSize: 1 };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('throws is outputSize > 1', () => {
        const data = [1, 2, 3, 4];
        const instance = { inputSize: 1, outputSize: 2 };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('formats array to array,floatArray', () => {
        const data = [1, 2, 3, 4];
        const instance = { inputSize: 1, outputSize: 1 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        expect(result).toEqual([
          [
            Float32Array.from([1]),
            Float32Array.from([2]),
            Float32Array.from([3]),
            Float32Array.from([4]),
          ],
        ]);
      });
      it('formats array,array to array,floatArray w/ inputSize of 1', () => {
        const data = [
          [1, 2, 3, 4],
          [4, 3, 2, 1],
        ];
        const instance = { inputSize: 1, outputSize: 1 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        expect(result).toEqual([
          [
            Float32Array.from([1]),
            Float32Array.from([2]),
            Float32Array.from([3]),
            Float32Array.from([4]),
          ],
          [
            Float32Array.from([4]),
            Float32Array.from([3]),
            Float32Array.from([2]),
            Float32Array.from([1]),
          ],
        ]);
      });
      it('throws array,array to array,floatArray w/ inputSize greater than data', () => {
        const data = [
          [1, 4],
          [2, 3],
          [3, 2],
          [4, 1],
        ];
        const instance = { inputSize: 3, outputSize: 2 };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('throws array,array to array,floatArray w/ outputSize greater than data', () => {
        const data = [
          [1, 4],
          [2, 3],
          [3, 2],
          [4, 1],
        ];
        const instance = { inputSize: 2, outputSize: 3 };
        expect(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }).toThrow();
      });
      it('formats array,array to array,floatArray w/ inputSize greater than 1', () => {
        const data = [
          [1, 4],
          [2, 3],
          [3, 2],
          [4, 1],
        ];
        const instance = { inputSize: 2, outputSize: 2 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        expect(result).toEqual([
          [
            Float32Array.from([1, 4]),
            Float32Array.from([2, 3]),
            Float32Array.from([3, 2]),
            Float32Array.from([4, 1]),
          ],
        ]);
      });
      it('formats array,array,array to array,array,floatArray w/ inputSize greater than 1', () => {
        const data = [
          [
            [1, 5],
            [2, 4],
            [3, 3],
            [4, 2],
            [5, 1],
          ],
          [
            [5, 9],
            [6, 8],
            [7, 7],
            [8, 6],
            [9, 5],
          ],
        ];
        const instance = { inputSize: 2 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        expect(result).toEqual([
          [
            Float32Array.from([1, 5]),
            Float32Array.from([2, 4]),
            Float32Array.from([3, 3]),
            Float32Array.from([4, 2]),
            Float32Array.from([5, 1]),
          ],
          [
            Float32Array.from([5, 9]),
            Float32Array.from([6, 8]),
            Float32Array.from([7, 7]),
            Float32Array.from([8, 6]),
            Float32Array.from([9, 5]),
          ],
        ]);
      });
    });
  });
  describe('.toFunction()', () => {
    it('processes array same as net w/ inputSize of 1', () => {
      const data = [{ input: [1, 2], output: [3, 4] }];
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1,
      });
      net.train(data, { iteration: 100, errorThresh: 0.05 });
      const fn = net.toFunction(istanbulLinkerUtil);
      const expected = net.run(data[0].input);
      const result = fn(data[0].input);
      expect(typeof result).toBe('number');
      expect(result).toEqual(expected);
    });

    it('processes object same as net w/ inputSize of 1', () => {
      const data = [{ input: { a: 1, b: 2 }, output: { c: 3, d: 4 } }];
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1,
      });
      net.train(data, { iteration: 100, errorThresh: 0.05 });
      const fn = net.toFunction(istanbulLinkerUtil);
      const expected = net.run(data[0].input);
      expect(fn(data[0].input)).toEqual(expected);
    });

    it('processes array,object same as net', () => {
      const data = [
        {
          input: [
            { a: 1, b: 4 },
            { a: 2, b: 3 },
          ],
          output: [
            { c: 3, d: 2 },
            { c: 4, d: 1 },
          ],
        },
      ];
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2,
      });
      net.train(data, { iteration: 100, errorThresh: 0.05 });
      const fn = net.toFunction(istanbulLinkerUtil);
      const expected = net.run(data[0].input);
      expect(fn(data[0].input)).toEqual(expected);
    });
    it('processes array same as net', () => {
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1,
      });

      // Same test as previous, but combined on a single set
      const trainingData = [
        [0.1, 0.2, 0.3, 0.4, 0.5],
        [0.5, 0.4, 0.3, 0.2, 0.1],
      ];

      const trainResult = net.train(trainingData);
      expect(trainResult.error).toBeLessThan(0.09);
      const closeToFive = net.run([0.1, 0.2, 0.3, 0.4]);
      const closeToOne = net.run([0.5, 0.4, 0.3, 0.2]);
      const fn = net.toFunction(istanbulLinkerUtil);
      expect(closeToFive.toFixed(1)).toBe('0.5');
      expect(closeToOne.toFixed(1)).toBe('0.1');
      expect(fn([0.1, 0.2, 0.3, 0.4])).toBe(closeToFive);
      expect(fn([0.5, 0.4, 0.3, 0.2])).toBe(closeToOne);
    });
    it('processes array,array same as net', () => {
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2,
      });

      // Same test as previous, but combined on a single set
      const trainingData = [
        [0.1, 0.5],
        [0.2, 0.4],
        [0.3, 0.3],
        [0.4, 0.2],
        [0.5, 0.1],
      ];

      const trainResult = net.train(trainingData);
      expect(trainResult.error).toBeLessThan(0.09);
      const closeToFiveAndOne = net.run([
        [0.1, 0.5],
        [0.2, 0.4],
        [0.3, 0.3],
        [0.4, 0.2],
      ]);
      const fn = net.toFunction(istanbulLinkerUtil);
      const result = fn([
        [0.1, 0.5],
        [0.2, 0.4],
        [0.3, 0.3],
        [0.4, 0.2],
      ]);
      expect(closeToFiveAndOne[0].toFixed(1)).toBe('0.5');
      expect(closeToFiveAndOne[1].toFixed(1)).toBe('0.1');
      expect(result[0]).toBe(closeToFiveAndOne[0]);
      expect(result[1]).toBe(closeToFiveAndOne[1]);
    });
    it('processes object same as net', () => {
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1,
      });

      // Same test as previous, but combined on a single set
      const trainingData = [
        {
          input: { monday: 0.1, tuesday: 0.2, wednesday: 0.3, thursday: 0.4 },
          output: { friday: 0.5 },
        },
        {
          input: { monday: 0.5, tuesday: 0.4, wednesday: 0.3, thursday: 0.2 },
          output: { friday: 0.1 },
        },
      ];
      const trainResult = net.train(trainingData);
      expect(trainResult.error).toBeLessThan(0.09);
      const closeToFive = net.run({
        monday: 0.1,
        tuesday: 0.2,
        wednesday: 0.3,
        thursday: 0.4,
      });
      const closeToOne = net.run({
        monday: 0.5,
        tuesday: 0.4,
        wednesday: 0.3,
        thursday: 0.2,
      });
      const fn = net.toFunction(istanbulLinkerUtil);
      expect(closeToFive.friday.toFixed(1)).toBe('0.5');
      expect(closeToOne.friday.toFixed(1)).toBe('0.1');
      expect(
        fn({ monday: 0.1, tuesday: 0.2, wednesday: 0.3, thursday: 0.4 }).friday
      ).toBe(closeToFive.friday);
      expect(
        fn({ monday: 0.5, tuesday: 0.4, wednesday: 0.3, thursday: 0.2 }).friday
      ).toBe(closeToOne.friday);
    });
    it('handles array,object to array,object with lookup tables being same w/ inputSize of 1', () => {
      const inputSize = 1;
      const hiddenLayers = [10];
      const outputSize = 1;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize,
      });
      net.train([
        { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 },
      ]);
      const fn = net.toFunction(istanbulLinkerUtil);
      const result = fn({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 });
      expect(result).toEqual(
        net.run({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 })
      );
      expect(Object.keys(result).length).toBe(1);
      expect(result.friday.toFixed(0)).toBe('5');
    });
  });
  describe('.test()', () => {
    describe('using array,array', () => {
      describe('inputSize of 1', () => {
        it('accumulates no error or misclasses when no error', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          jest.spyOn(net, 'formatData');
          net.run = jest.fn(() => {
            return [0.5];
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          const testResult = net.test([[0.1, 0.2, 0.3, 0.4, 0.5]]);
          expect(net.formatData).toBeCalled();
          expect(net.run).toBeCalled();
          expect(net.run.mock.calls[0][0]).toEqual(
            [[0.1], [0.2], [0.3], [0.4]].map((v) => Float32Array.from(v))
          );
          expect(testResult.error).toBe(0);
          expect(testResult.misclasses.length).toBe(0);
        });
        it('accumulates error and misclasses when error', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          jest.spyOn(net, 'formatData');
          net.run = jest.fn(() => {
            return [0.1];
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          const testResult = net.test([[0.1, 0.2, 0.3, 0.4, 0.5]]);
          expect(net.formatData).toBeCalled();
          expect(net.run).toBeCalled();
          expect(net.run.mock.calls[0][0]).toEqual(
            [[0.1], [0.2], [0.3], [0.4]].map((v) => Float32Array.from(v))
          );
          expect(testResult.error).toBeGreaterThan(0.1);
          expect(testResult.misclasses.length).toBe(1);
        });
      });
      describe('inputSize of 2', () => {
        it('throws', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          jest.spyOn(net, 'formatData');
          net.run = jest.fn(() => {
            return [0.1];
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          expect(() => {
            net.test([[0.1, 0.2, 0.3, 0.4, 0.5]]);
          }).toThrow();
          // expect(net.formatData).toBeCalled();
          // expect(net.run).toBeCalled();
          // expect(net.run.mock.calls[0][0]).toEqual([[.1],[.2],[.3],[.4]].map(v => Float32Array.from(v)));
          // expect(testResult.error).toBeGreaterThan(.1);
          // expect(testResult.misclasses.length).toBe(1);
        });
      });
    });
    describe('using array,array,array', () => {
      describe('inputSize of 2', () => {
        describe('no error', () => {
          it('can test', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2,
            });
            jest.spyOn(net, 'formatData');
            net.run = jest.fn(() => {
              return Float32Array.from([0.5, 0.1]);
            });
            net.trainOpts = {
              errorThresh: 0.001,
            };
            const testResult = net.test([
              [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
                [0.5, 0.1],
              ],
            ]);
            expect(net.formatData).toBeCalled();
            expect(net.run).toBeCalled();
            expect(testResult.error).toBe(0);
            expect(testResult.misclasses.length).toBe(0);
          });
        });
        describe('some error', () => {
          it('can test', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2,
            });
            net.trainOpts = {
              errorThresh: 0.001,
            };
            jest.spyOn(net, 'formatData');
            net.run = jest.fn(() => {
              return Float32Array.from([0.1, 0.5]);
            });
            const testResult = net.test([
              [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
                [0.5, 0.1],
              ],
            ]);
            expect(net.formatData).toBeCalled();
            expect(net.run).toBeCalled();
            expect(testResult.error).toBeGreaterThanOrEqual(0.1);
            expect(testResult.misclasses.length).toBe(1);
            expect(testResult.misclasses).toEqual([
              {
                value: [
                  [0.1, 0.5],
                  [0.2, 0.4],
                  [0.3, 0.3],
                  [0.4, 0.2],
                  [0.5, 0.1],
                ],
                actual: Float32Array.from([0.1, 0.5]),
              },
            ]);
          });
        });
      });
    });
    describe('using array,object', () => {
      describe('inputSize of 1', () => {
        describe('no error', () => {
          it('can test w/ forecastNumbers of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [10],
              outputSize: 1,
            });
            jest.spyOn(net, 'formatData');
            net.forecastNumbers = jest.fn((data, count) => {
              expect(count).toBe(1);
              return [0.5];
            });
            net.trainOpts = {
              errorThresh: 0.001,
            };
            net.inputLookup = net.outputLookup = {
              monday: 0,
              tuesday: 1,
              wednesday: 2,
              thursday: 3,
              friday: 4,
            };
            net.inputLookupLength = net.outputLookupLength = Object.keys(
              net.inputLookup
            ).length;
            const testResult = net.test([
              {
                monday: 0.1,
                tuesday: 0.2,
                wednesday: 0.3,
                thursday: 0.4,
                friday: 0.5,
              },
            ]);
            expect(net.formatData).toBeCalled();
            expect(net.forecastNumbers).toBeCalled();
            expect(net.forecastNumbers.mock.calls[0][0]).toEqual(
              Float32Array.from([0.1, 0.2, 0.3, 0.4])
            );
            expect(net.forecastNumbers.mock.calls[0][1]).toEqual(1);
            expect(testResult.error).toBe(0);
            expect(testResult.misclasses.length).toBe(0);
          });
        });
        describe('some error', () => {
          it('can test w/ forecastNumbers of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [10],
              outputSize: 1,
            });
            net.trainOpts = {
              errorThresh: 0.001,
            };
            jest.spyOn(net, 'formatData');
            net.forecastNumbers = jest.fn((data, count) => {
              expect(count).toBeTruthy();
              return [0.1];
            });
            net.inputLookup = net.outputLookup = {
              monday: 0,
              tuesday: 1,
              wednesday: 2,
              thursday: 3,
              friday: 4,
            };
            net.inputLookupLength = net.outputLookupLength = Object.keys(
              net.inputLookup
            ).length;
            const testResult = net.test([
              {
                monday: 0.1,
                tuesday: 0.2,
                wednesday: 0.3,
                thursday: 0.4,
                friday: 0.5,
              },
            ]);
            expect(net.formatData).toBeCalled();
            expect(net.forecastNumbers).toBeCalled();
            expect(net.forecastNumbers.mock.calls[0][0]).toEqual(
              Float32Array.from([0.1, 0.2, 0.3, 0.4])
            );
            expect(testResult.error).toBeGreaterThanOrEqual(0.08);
            expect(testResult.misclasses.length).toBe(1);
            expect(testResult.misclasses).toEqual([
              {
                value: {
                  monday: 0.1,
                  tuesday: 0.2,
                  wednesday: 0.3,
                  thursday: 0.4,
                  friday: 0.5,
                },
                actual: { friday: 0.1 },
              },
            ]);
          });
        });
      });
    });
    describe('using array,array,object', () => {
      describe('inputSize of 2', () => {
        describe('no error', () => {
          it('can test w/ run of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2,
            });
            jest.spyOn(net, 'formatData');
            net.run = jest.fn(() => {
              return { low: 0.5, high: 0.1 };
            });
            net.trainOpts = {
              errorThresh: 0.001,
            };
            net.inputLookup = net.outputLookup = {
              low: 0,
              high: 1,
            };
            net.inputLookupLength = net.outputLookupLength = Object.keys(
              net.inputLookup
            ).length;
            const testResult = net.test([
              [
                { low: 0.1, high: 0.5 },
                { low: 0.2, high: 0.4 },
                { low: 0.3, high: 0.3 },
                { low: 0.4, high: 0.2 },
                { low: 0.5, high: 0.1 },
              ],
            ]);
            expect(net.formatData).toBeCalled();
            expect(net.run).toBeCalled();
            expect(net.run.mock.calls[0][0]).toEqual(
              [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
              ].map((v) => Float32Array.from(v))
            );
            expect(testResult.error).toBe(0);
            expect(testResult.misclasses.length).toBe(0);
          });
        });
        describe('some error', () => {
          it('can test w/ run of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2,
            });
            jest.spyOn(net, 'formatData');
            net.run = jest.fn(() => {
              return { low: 0.9, high: 0.9 };
            });
            net.trainOpts = {
              errorThresh: 0.001,
            };
            net.inputLookup = net.outputLookup = {
              low: 0,
              high: 1,
            };
            net.inputLookupLength = net.outputLookupLength = Object.keys(
              net.inputLookup
            ).length;
            const testResult = net.test([
              [
                { low: 0.1, high: 0.5 },
                { low: 0.2, high: 0.4 },
                { low: 0.3, high: 0.3 },
                { low: 0.4, high: 0.2 },
                { low: 0.5, high: 0.1 },
              ],
            ]);
            expect(net.formatData).toBeCalled();
            expect(net.run).toBeCalled();
            expect(net.run.mock.calls[0][0]).toEqual(
              [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
              ].map((v) => Float32Array.from(v))
            );
            expect(testResult.error).toBeGreaterThan(0.3);
            expect(testResult.misclasses.length).toBe(1);
            expect(testResult.misclasses).toEqual([
              {
                value: [
                  { low: 0.1, high: 0.5 },
                  { low: 0.2, high: 0.4 },
                  { low: 0.3, high: 0.3 },
                  { low: 0.4, high: 0.2 },
                  { low: 0.5, high: 0.1 },
                ],
                actual: { low: 0.9, high: 0.9 },
              },
            ]);
          });
        });
      });
    });
    describe('using array,datum,array', () => {
      describe('no error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(1);
            return [0.5];
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          const testResult = net.test([
            { input: [0.1, 0.2, 0.3, 0.4], output: [0.5] },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(net.forecast.mock.calls[0][0]).toEqual(
            [[0.1], [0.2], [0.3], [0.4]].map((v) => Float32Array.from(v))
          );
          expect(net.forecast.mock.calls[0][1]).toEqual(1);
          expect(testResult.error).toBe(0);
          expect(testResult.misclasses.length).toBe(0);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(2);
            return Float32Array.from([0.4, 0.5]);
          });
          const testResult = net.test([
            { input: [0.1, 0.2, 0.3], output: [0.4, 0.5] },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(net.forecast.mock.calls[0][0]).toEqual(
            [[0.1], [0.2], [0.3]].map((v) => Float32Array.from(v))
          );
          expect(net.forecast.mock.calls[0][1]).toBe(2);
          expect(testResult.error).toBe(0);
          expect(testResult.misclasses.length).toBe(0);
        });
      });
      describe('some error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBeTruthy();
            return [0.1];
          });
          const testResult = net.test([
            { input: [0.1, 0.2, 0.3, 0.4], output: [0.5] },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(net.forecast.mock.calls[0][0]).toEqual(
            [[0.1], [0.2], [0.3], [0.4]].map((v) => Float32Array.from(v))
          );
          expect(testResult.error).toBeGreaterThanOrEqual(0.08);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              input: [0.1, 0.2, 0.3, 0.4],
              output: [0.5],
              actual: [0.1],
            },
          ]);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(2);
            return [0.2, 0.1];
          });
          const testResult = net.test([
            { input: [0.1, 0.2, 0.3], output: [0.4, 0.5] },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error).toBeGreaterThanOrEqual(0.08);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              input: [0.1, 0.2, 0.3],
              output: [0.4, 0.5],
              actual: [0.2, 0.1],
            },
          ]);
        });
      });
    });
    describe('using array,datum,object', () => {
      describe('inputSize of 1', () => {
        describe('no error', () => {
          it('can test w/ forecastNumbers of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [10],
              outputSize: 1,
            });
            jest.spyOn(net, 'formatData');
            net.forecast = jest.fn((data, count) => {
              expect(count).toBe(1);
              return [0.5];
            });
            net.trainOpts = {
              errorThresh: 0.001,
            };
            net.inputLookup = {
              monday: 0,
              tuesday: 1,
              wednesday: 2,
              thursday: 3,
            };
            net.inputLookupLength = Object.keys(net.inputLookup).length;
            net.outputLookup = {
              friday: 0,
            };
            net.outputLookupLength = Object.keys(net.outputLookup).length;
            const testResult = net.test([
              {
                input: {
                  monday: 0.1,
                  tuesday: 0.2,
                  wednesday: 0.3,
                  thursday: 0.4,
                },
                output: { friday: 0.5 },
              },
            ]);
            expect(net.formatData).toBeCalled();
            expect(net.forecast).toBeCalled();
            expect(net.forecast.mock.calls[0][0]).toEqual(
              [[0.1], [0.2], [0.3], [0.4]].map((v) => Float32Array.from(v))
            );
            expect(net.forecast.mock.calls[0][1]).toEqual(1);
            expect(testResult.error).toBe(0);
            expect(testResult.misclasses.length).toBe(0);
          });
        });
        describe('some error', () => {
          it('can test w/ forecastNumbers of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [10],
              outputSize: 1,
            });
            net.trainOpts = {
              errorThresh: 0.001,
            };
            jest.spyOn(net, 'formatData');
            net.forecast = jest.fn((data, count) => {
              expect(count).toBeTruthy();
              return [0.1];
            });
            net.inputLookup = {
              monday: 0,
              tuesday: 1,
              wednesday: 2,
              thursday: 3,
            };
            net.inputLookupLength = Object.keys(net.inputLookup).length;
            net.outputLookup = {
              friday: 0,
            };
            net.outputLookupLength = Object.keys(net.outputLookup).length;
            const testResult = net.test([
              {
                input: {
                  monday: 0.1,
                  tuesday: 0.2,
                  wednesday: 0.3,
                  thursday: 0.4,
                },
                output: { friday: 0.5 },
              },
            ]);
            expect(net.formatData).toBeCalled();
            expect(net.forecast).toBeCalled();
            expect(net.forecast.mock.calls[0][0]).toEqual(
              [[0.1], [0.2], [0.3], [0.4]].map((v) => Float32Array.from(v))
            );
            expect(testResult.error).toBeGreaterThanOrEqual(0.08);
            expect(testResult.misclasses.length).toBe(1);
            expect(testResult.misclasses).toEqual([
              {
                input: {
                  monday: 0.1,
                  tuesday: 0.2,
                  wednesday: 0.3,
                  thursday: 0.4,
                },
                output: { friday: 0.5 },
                actual: { friday: 0.1 },
              },
            ]);
          });
        });
      });
    });
    describe('using array,datum,array,array', () => {
      describe('no error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(1);
            return [[0.5, 0.1]].map((v) => Float32Array.from(v));
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          const testResult = net.test([
            {
              input: [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
              ],
              output: [[0.5, 0.1]],
            },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error).toBe(0);
          expect(testResult.misclasses.length).toBe(0);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(2);
            return [
              [0.4, 0.2],
              [0.5, 0.1],
            ].map((v) => Float32Array.from(v));
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          const testResult = net.test([
            {
              input: [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
              ],
              output: [
                [0.4, 0.2],
                [0.5, 0.1],
              ],
            },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error).toBe(0);
          expect(testResult.misclasses.length).toBe(0);
        });
      });
      describe('some error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBeTruthy();
            return [[0.1, 0.5]].map((v) => Float32Array.from(v));
          });
          const testResult = net.test([
            {
              input: [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
              ],
              output: [[0.5, 0.1]],
            },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error >= 0.1).toBeTruthy();
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              input: [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
                [0.4, 0.2],
              ],
              output: [[0.5, 0.1]],
              actual: [[0.1, 0.5]].map((v) => Float32Array.from(v)),
            },
          ]);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(2);
            return [
              [0.9, 0.9],
              [0.9, 0.9],
            ].map((v) => Float32Array.from(v));
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          const testResult = net.test([
            {
              input: [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
              ],
              output: [
                [0.4, 0.2],
                [0.5, 0.1],
              ],
            },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error).toBeGreaterThanOrEqual(0.08);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              input: [
                [0.1, 0.5],
                [0.2, 0.4],
                [0.3, 0.3],
              ],
              output: [
                [0.4, 0.2],
                [0.5, 0.1],
              ],
              actual: [
                [0.9, 0.9],
                [0.9, 0.9],
              ].map((v) => Float32Array.from(v)),
            },
          ]);
        });
      });
    });
    describe('using array,datum,array,object', () => {
      describe('no error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(1);
            return [{ low: 0.5, high: 0.1 }];
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          net.inputLookup = {
            low: 0,
            high: 1,
          };
          net.inputLookupLength = Object.keys(net.inputLookup).length;
          net.outputLookup = {
            low: 0,
            high: 1,
          };
          net.outputLookupLength = Object.keys(net.outputLookup).length;
          const testResult = net.test([
            {
              input: [
                { low: 0.1, high: 0.5 },
                { low: 0.2, high: 0.4 },
                { low: 0.3, high: 0.3 },
                { low: 0.4, high: 0.2 },
              ],
              output: [{ low: 0.5, high: 0.1 }],
            },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error).toBe(0);
          expect(testResult.misclasses.length).toBe(0);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(2);
            return [
              { low: 0.4, high: 0.2 },
              { low: 0.5, high: 0.1 },
            ];
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          net.inputLookup = {
            low: 0,
            high: 1,
          };
          net.inputLookupLength = Object.keys(net.inputLookup).length;
          net.outputLookup = {
            low: 0,
            high: 1,
          };
          net.outputLookupLength = Object.keys(net.outputLookup).length;
          const testResult = net.test([
            {
              input: [
                { low: 0.1, high: 0.5 },
                { low: 0.2, high: 0.4 },
                { low: 0.3, high: 0.3 },
              ],
              output: [
                { low: 0.4, high: 0.2 },
                { low: 0.5, high: 0.1 },
              ],
            },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error).toBe(0);
          expect(testResult.misclasses.length).toBe(0);
        });
      });
      describe('some error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          net.inputLookup = {
            low: 0,
            high: 1,
          };
          net.inputLookupLength = Object.keys(net.inputLookup).length;
          net.outputLookup = {
            low: 0,
            high: 1,
          };
          net.outputLookupLength = Object.keys(net.outputLookup).length;
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBeTruthy();
            return [{ low: 0.1, high: 0.5 }];
          });
          const testResult = net.test([
            {
              input: [
                { low: 0.1, high: 0.5 },
                { low: 0.2, high: 0.4 },
                { low: 0.3, high: 0.3 },
                { low: 0.4, high: 0.2 },
              ],
              output: [{ low: 0.5, high: 0.1 }],
            },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error >= 0.1).toBeTruthy();
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              input: [
                { low: 0.1, high: 0.5 },
                { low: 0.2, high: 0.4 },
                { low: 0.3, high: 0.3 },
                { low: 0.4, high: 0.2 },
              ],
              output: [{ low: 0.5, high: 0.1 }],
              actual: [{ low: 0.1, high: 0.5 }],
            },
          ]);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          jest.spyOn(net, 'formatData');
          net.forecast = jest.fn((data, count) => {
            expect(count).toBe(2);
            return [
              { low: 0.9, high: 0.9 },
              { low: 0.9, high: 0.9 },
            ];
          });
          net.trainOpts = {
            errorThresh: 0.001,
          };
          net.inputLookup = {
            low: 0,
            high: 1,
          };
          net.inputLookupLength = Object.keys(net.inputLookup).length;
          net.outputLookup = {
            low: 0,
            high: 1,
          };
          net.outputLookupLength = Object.keys(net.outputLookup).length;
          const testResult = net.test([
            {
              input: [
                { low: 0.1, high: 0.5 },
                { low: 0.2, high: 0.4 },
                { low: 0.3, high: 0.3 },
              ],
              output: [
                { low: 0.4, high: 0.2 },
                { low: 0.5, high: 0.1 },
              ],
            },
          ]);
          expect(net.formatData).toBeCalled();
          expect(net.forecast).toBeCalled();
          expect(testResult.error).toBeGreaterThanOrEqual(0.08);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              input: [
                { low: 0.1, high: 0.5 },
                { low: 0.2, high: 0.4 },
                { low: 0.3, high: 0.3 },
              ],
              output: [
                { low: 0.4, high: 0.2 },
                { low: 0.5, high: 0.1 },
              ],
              actual: [
                { low: 0.9, high: 0.9 },
                { low: 0.9, high: 0.9 },
              ],
            },
          ]);
        });
      });
    });
  });
  describe('.addFormat()', () => {
    it('array,array,number', () => {
      const instance = {};
      RNNTimeStep.prototype.addFormat.call(instance, [[0]]);
      expect(instance).toEqual({});
    });
    it('datum,array,array,number', () => {
      const instance = {};
      RNNTimeStep.prototype.addFormat.call(instance, {
        input: [[0]],
        output: [[0]],
      });
      expect(instance).toEqual({});
    });
    it('array,number', () => {
      const instance = {};
      RNNTimeStep.prototype.addFormat.call(instance, [0]);
      expect(instance).toEqual({});
    });
    it('datum,array,number', () => {
      const instance = {};
      RNNTimeStep.prototype.addFormat.call(instance, {
        input: [0],
        output: [0],
      });
      expect(instance).toEqual({});
    });

    it('datum,object,number', () => {
      const instance = {
        inputLookup: { inputOne: 0 },
        outputLookup: { outputOne: 0 },
      };
      RNNTimeStep.prototype.addFormat.call(instance, {
        input: { inputTwo: 1, inputThree: 2 },
        output: { outputTwo: 1, outputThree: 2 },
      });
      expect(instance).toEqual({
        inputLookup: { inputOne: 0, inputTwo: 1, inputThree: 2 },
        inputLookupLength: 3,
        outputLookup: { outputOne: 0, outputTwo: 1, outputThree: 2 },
        outputLookupLength: 3,
      });
    });
    it('object,number', () => {
      const instance = {
        inputLookup: { inputOne: 0 },
      };
      RNNTimeStep.prototype.addFormat.call(instance, {
        inputTwo: 1,
        inputThree: 2,
      });
      expect(instance).toEqual({
        inputLookup: { inputOne: 0, inputTwo: 1, inputThree: 2 },
        inputLookupLength: 3,
        outputLookup: { inputOne: 0, inputTwo: 1, inputThree: 2 },
        outputLookupLength: 3,
      });
    });
    it('array,object,number', () => {});
    it('datum,array,object,number', () => {});
  });
  describe('.toJSON()', () => {
    it('saves network dimensions to json', () => {
      const inputSize = 4;
      const hiddenLayers = [1, 2, 3];
      const outputSize = 5;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize,
      });
      const {
        inputLookup,
        inputLookupLength,
        outputLookup,
        outputLookupLength,
      } = net;
      net.initialize();
      const json = net.toJSON();
      expect(json.options.inputSize).toBe(inputSize);
      expect(json.options.hiddenLayers).toEqual(hiddenLayers);
      expect(json.options.outputSize).toBe(outputSize);
      expect(json.inputLookup).toBe(inputLookup);
      expect(json.inputLookupLength).toBe(inputLookupLength);
      expect(json.outputLookup).toBe(outputLookup);
      expect(json.outputLookupLength).toBe(outputLookupLength);
    });
  });
  describe('.fromJSON()', () => {
    it('restores network dimensions from json', () => {
      const inputSize = 45;
      const hiddenLayers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const outputSize = 20;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize,
      });
      net.initialize();
      const json = net.toJSON();
      const {
        inputLookup,
        inputLookupLength,
        outputLookup,
        outputLookupLength,
      } = json;
      const serializedNet = new RNNTimeStep();
      serializedNet.fromJSON(json);
      expect(serializedNet.inputSize).toBe(inputSize);
      expect(serializedNet.hiddenLayers).toEqual(hiddenLayers);
      expect(serializedNet.outputSize).toBe(outputSize);
      expect(serializedNet.inputLookup).toBe(inputLookup);
      expect(serializedNet.inputLookupLength).toBe(inputLookupLength);
      expect(serializedNet.outputLookup).toBe(outputLookup);
      expect(serializedNet.outputLookupLength).toBe(outputLookupLength);
    });
    it('error rate stays same after serialization', () => {
      const inputSize = 1;
      const hiddenLayers = [10];
      const outputSize = 1;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize,
      });
      let lastNetStatus;
      const trainingData = [
        { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 },
      ];
      net.train(trainingData, {
        log: (status) => {
          lastNetStatus = status;
        },
        iterations: 50,
      });
      net.run({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 });
      const json = net.toJSON();
      const serializedNet = new RNNTimeStep();
      serializedNet.fromJSON(json);
      let lastSerializedNetStatus;
      serializedNet.train(trainingData, {
        iterations: 1,
        log: (status) => {
          lastSerializedNetStatus = status;
        },
      });
      expect(
        lastSerializedNetStatus.split(' ').pop() <
          lastNetStatus.split(' ').pop()
      ).toBeTruthy();
    });
  });
});
