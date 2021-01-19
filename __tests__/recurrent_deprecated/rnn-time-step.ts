import { INumberHash } from '../../src/lookup';
import { LSTMTimeStep } from '../../src/recurrent/lstm-time-step';
import { Matrix } from '../../src/recurrent/matrix';
import { Equation } from '../../src/recurrent/matrix/equation';
import { IRNNStatus } from '../../src/recurrent/rnn';
import { RNNTimeStep } from '../../src/recurrent/rnn-time-step';

// TODO: break out LSTMTimeStep into its own tests

describe('RNNTimeStep', () => {
  describe('.constructor()', () => {
    describe('when using options.json', () => {
      let fromJSONSpy: jest.SpyInstance;
      beforeEach(() => {
        fromJSONSpy = jest.spyOn(RNNTimeStep.prototype, 'fromJSON');
      });
      afterEach(() => {
        fromJSONSpy.mockRestore();
      });
      it('calls this.fromJSON with this value', () => {
        const json = {
          type: 'RNNTimeStep',
          options: {
            inputSize: 1,
            inputRange: 1,
            hiddenLayers: [1],
            outputSize: 1,
            decayRate: 1,
            smoothEps: 1,
            regc: 1,
            clipval: 1,
            maxPredictionLength: 1,
          },
          hiddenLayers: [
            {
              weight: { rows: 1, columns: 1, weights: Float32Array.from([1]) },
              transition: {
                rows: 1,
                columns: 1,
                weights: Float32Array.from([1]),
              },
              bias: { rows: 1, columns: 1, weights: Float32Array.from([1]) },
            },
          ],
          outputConnector: {
            rows: 1,
            columns: 1,
            weights: Float32Array.from([1]),
          },
          output: { rows: 1, columns: 1, weights: Float32Array.from([1]) },
          inputLookup: { a: 0 },
          inputLookupLength: 1,
          outputLookup: { a: 0 },
          outputLookupLength: 1,
        };
        // eslint-disable-next-line no-new
        new RNNTimeStep({ json });
        expect(fromJSONSpy).toHaveBeenCalledWith(json);
      });
    });
  });
  describe('.createInputMatrix()', () => {
    it('throws', () => {
      expect(() => {
        new RNNTimeStep().createInputMatrix();
      }).toThrow();
    });
  });
  describe('.createOutputMatrix()', () => {
    it('creates the outputConnector and output for model', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [9, 11],
        outputSize: 5,
      });
      const { outputConnector, output } = net.createOutputMatrices();
      expect(outputConnector.rows).toBe(5);
      expect(outputConnector.columns).toBe(11);
      expect(output.rows).toBe(5);
      expect(output.columns).toBe(1);
    });
  });
  describe('.bindEquation()', () => {
    let getEquationSpy: jest.SpyInstance;
    beforeEach(() => {
      getEquationSpy = jest.spyOn(RNNTimeStep.prototype, 'getEquation');
    });
    afterEach(() => {
      getEquationSpy.mockRestore();
    });
    it('calls static getEquation method', () => {
      const net = new RNNTimeStep();
      net.initialize();
      net.bindEquation();
      expect(getEquationSpy).toBeCalled();
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
        const net = new RNNTimeStep({ hiddenLayers: [] });
        expect(() => {
          net.mapModel();
        }).not.toThrow();
      });
    });
    it('maps models to model.allMatrices', () => {
      const net = new RNNTimeStep();
      const model = net.mapModel();
      expect(model.allMatrices.length).toBe(5);
    });
  });
  describe('.backpropagate()', () => {
    let equationsBackpropagateSpy: jest.SpyInstance;
    beforeEach(() => {
      equationsBackpropagateSpy = jest.spyOn(
        Equation.prototype,
        'backpropagate'
      );
    });
    afterEach(() => {
      equationsBackpropagateSpy.mockRestore();
    });
    it('steps through model.equations in reverse, calling model.equations[index].backpropagate', () => {
      const net = new RNNTimeStep();
      for (let i = 0; i < 3; i++) {
        const equation = new Equation();
        equation.add(new Matrix(1, 1), new Matrix(1, 1));
        net.model.equations.push(equation);
      }
      net.backpropagate();
      expect(equationsBackpropagateSpy).toHaveBeenCalledTimes(3);
    });
  });
  describe('.run()', () => {
    describe('when called with unknown data shape', () => {
      it('throws', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 1 });
        net.initialize();
        net.train([[1, 2]], { iterations: 1 });
        expect(() => {
          net.run({ one: 1, two: 2 });
        }).toThrow();
      });
    });
    describe('when called with array,number data shape', () => {
      let runArraySpy: jest.SpyInstance;
      beforeEach(() => {
        runArraySpy = jest.spyOn(RNNTimeStep.prototype, 'runArray');
      });
      afterEach(() => {
        runArraySpy.mockRestore();
      });
      it('calls this.runArray() and returns value from there', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 1 });
        net.initialize();
        net.train([[1, 2]], { iterations: 1 });
        const result = net.run([1, 2]);
        expect(result).toBeGreaterThan(0);
        expect(runArraySpy).toHaveBeenCalledWith([1, 2]);
      });
    });
    describe('when called with array,array,number data shape', () => {
      let runArrayOfArraySpy: jest.SpyInstance;
      beforeEach(() => {
        runArrayOfArraySpy = jest.spyOn(
          RNNTimeStep.prototype,
          'runArrayOfArray'
        );
      });
      afterEach(() => {
        runArrayOfArraySpy.mockRestore();
      });
      it('calls this.runArrayOfArray()', () => {
        const net = new RNNTimeStep({ inputSize: 4, outputSize: 4 });
        net.initialize();
        const item1 = [
          [1, 2, 3, 4],
          [4, 3, 2, 1],
        ];
        const item2 = [
          [4, 3, 2, 1],
          [1, 2, 3, 4],
        ];
        net.train([item1, item2], { iterations: 1 });
        net.run(item1);
        expect(runArrayOfArraySpy).toHaveBeenCalledWith(item1);
      });
    });
    describe('when called with array,object,number data shape', () => {
      let runArrayOfObjectSpy: jest.SpyInstance;
      beforeEach(() => {
        runArrayOfObjectSpy = jest.spyOn(
          RNNTimeStep.prototype,
          'runArrayOfObject'
        );
      });
      afterEach(() => {
        runArrayOfObjectSpy.mockRestore();
      });
      it('calls this.runArrayOfArray()', () => {
        const net = new RNNTimeStep({ inputSize: 4, outputSize: 4 });
        net.initialize();
        const oneToFour = { low: 1, high: 2, mid: 3, total: 4 };
        const fourToOne = { low: 4, high: 3, mid: 2, total: 1 };
        const item1 = [oneToFour, fourToOne];
        const item2 = [fourToOne, oneToFour];
        net.train([item1, item2], { iterations: 1 });
        net.run(item1);
        expect(runArrayOfObjectSpy).toHaveBeenCalledWith(item1);
      });
    });
  });
  describe('.runArrayOfArray()', () => {
    describe('when network is not runnable', () => {
      it('throws', () => {
        expect(() => {
          const net = new RNNTimeStep();
          net.runArrayOfArray([Float32Array.from([1])]);
        }).toThrow();
      });
    });
    describe('when network is runnable', () => {
      let runInputSpy: jest.SpyInstance;
      beforeEach(() => {
        runInputSpy = jest.spyOn(Equation.prototype, 'runInput');
      });
      afterEach(() => {
        runInputSpy.mockRestore();
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
        net.runArrayOfArray([
          Float32Array.from([1, 3]),
          Float32Array.from([2, 2]),
          Float32Array.from([3, 1]),
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
        net.bindEquation();
        net.runArrayOfArray(
          [
            [1, 3],
            [2, 2],
            [3, 1],
          ].map((v) => Float32Array.from(v))
        );
        expect(runInputSpy.mock.instances.length).toBe(4);
        expect(runInputSpy.mock.calls.length).toBe(4);
        expect(runInputSpy.mock.calls[0][0]).toEqual(Float32Array.from([1, 3]));
        expect(runInputSpy.mock.calls[1][0]).toEqual(Float32Array.from([2, 2]));
        expect(runInputSpy.mock.calls[2][0]).toEqual(Float32Array.from([3, 1]));
        expect(runInputSpy.mock.calls[3][0]).toEqual(Float32Array.from([0, 0]));
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
        net.runArrayOfArray([
          Float32Array.from([1, 3]),
          Float32Array.from([2, 2]),
          Float32Array.from([3, 1]),
        ]);
        expect(stub).toBeCalled();
      });
    });
  });
  describe('.train()', () => {
    it('throws on array,datum,array w/ inputSize of 2', () => {
      const data = [{ input: [1, 2], output: [3, 4] }];
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 1,
      });
      expect(() => {
        net.train(data);
      }).toThrow('manually set inputSize and outputSize mismatch');
    });
    it('throws on array,datum,array w/ outputSize of 2', () => {
      const data = [{ input: [1, 2], output: [3, 4] }];
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 2,
      });
      expect(() => {
        net.train(data);
      }).toThrow('manually set inputSize and outputSize mismatch');
    });
    it('throws on array,datum,object w/ inputSize of 2', () => {
      const data = [{ input: { a: 1, b: 2 }, output: { c: 3, d: 4 } }];
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2,
      });
      expect(() => {
        net.train(data);
      }).toThrow('inputSize must be 1 for this data size');
    });

    describe('automatically setting options.inputSize and options.outputSize', () => {
      describe('array', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [[0.1, 0.2, 0.3, 0.4, 0.5]];
          const options = {
            iterations: 0,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.options.inputSize).toBe(1);
          expect(net.options.outputSize).toBe(1);
        });
      });
      describe('array of array', () => {
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
          expect(net.options.inputSize).toBe(2);
          expect(net.options.outputSize).toBe(2);
        });
      });
      describe('array of object in single long array', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [{ low: 0.1, med: 0.25, high: 0.5 }];
          const options = {
            iterations: 1,
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          expect(net.options.inputSize).toBe(1);
          expect(net.options.outputSize).toBe(1);
        });
      });
      describe('array of object in multiple array', () => {
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
          expect(net.options.inputSize).toBe(3);
          expect(net.options.outputSize).toBe(3);
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
          expect(net.options.inputSize).toBe(1);
          expect(net.options.outputSize).toBe(1);
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
          expect(net.options.inputSize).toBe(2);
          expect(net.options.outputSize).toBe(2);
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
          expect(net.options.inputSize).toBe(1);
          expect(net.options.outputSize).toBe(1);
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
          expect(net.options.inputSize).toBe(2);
          expect(net.options.outputSize).toBe(2);
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
        expect(net.options.inputSize).toBe(99);
        expect(net.options.outputSize).toBe(88);
      });
    });
    describe('calling using arrays', () => {
      describe('training data with 1D arrays', () => {
        describe('end to end', () => {
          let trainArraysSpy: jest.SpyInstance;
          let predictTargetSpy: jest.SpyInstance;
          beforeEach(() => {
            trainArraysSpy = jest.spyOn(
              RNNTimeStep.prototype,
              'trainArrayOfArray'
            );
            predictTargetSpy = jest.spyOn(Equation.prototype, 'predictTarget');
          });
          afterEach(() => {
            trainArraysSpy.mockRestore();
            predictTargetSpy.mockRestore();
          });
          it('uses .runInputNumbers with correct arguments', () => {
            const net = new RNNTimeStep({
              inputSize: 1,
              hiddenLayers: [1],
              outputSize: 1,
            });
            const trainingData = [
              [0.1, 0.2, 0.3, 0.4, 0.5],
              [0.5, 0.4, 0.3, 0.2, 0.1],
            ];
            net.train(trainingData, { iterations: 1 });
            expect(trainArraysSpy.mock.calls.length).toBe(2);
            expect(trainArraysSpy.mock.calls[0].length).toBe(1);
            expect(trainArraysSpy.mock.calls[0][0]).toEqual(
              trainingData[0].map((value) => Float32Array.from([value]))
            );
            expect(trainArraysSpy.mock.calls[1][0]).toEqual(
              trainingData[1].map((value) => Float32Array.from([value]))
            );
            expect(predictTargetSpy.mock.calls.length).toBe(8);
            expect(net.model.equations.length).toBe(5);

            // first array
            expect(predictTargetSpy.mock.calls[0][0]).toEqual(
              Float32Array.from([0.1])
            );
            expect(predictTargetSpy.mock.calls[0][1]).toEqual(
              Float32Array.from([0.2])
            );

            expect(predictTargetSpy.mock.calls[1][0]).toEqual(
              Float32Array.from([0.2])
            );
            expect(predictTargetSpy.mock.calls[1][1]).toEqual(
              Float32Array.from([0.3])
            );

            expect(predictTargetSpy.mock.calls[2][0]).toEqual(
              Float32Array.from([0.3])
            );
            expect(predictTargetSpy.mock.calls[2][1]).toEqual(
              Float32Array.from([0.4])
            );

            expect(predictTargetSpy.mock.calls[3][0]).toEqual(
              Float32Array.from([0.4])
            );
            expect(predictTargetSpy.mock.calls[3][1]).toEqual(
              Float32Array.from([0.5])
            );

            // second array
            expect(predictTargetSpy.mock.calls[4][0]).toEqual(
              Float32Array.from([0.5])
            );
            expect(predictTargetSpy.mock.calls[4][1]).toEqual(
              Float32Array.from([0.4])
            );

            expect(predictTargetSpy.mock.calls[5][0]).toEqual(
              Float32Array.from([0.4])
            );
            expect(predictTargetSpy.mock.calls[5][1]).toEqual(
              Float32Array.from([0.3])
            );

            expect(predictTargetSpy.mock.calls[6][0]).toEqual(
              Float32Array.from([0.3])
            );
            expect(predictTargetSpy.mock.calls[6][1]).toEqual(
              Float32Array.from([0.2])
            );

            expect(predictTargetSpy.mock.calls[7][0]).toEqual(
              Float32Array.from([0.2])
            );
            expect(predictTargetSpy.mock.calls[7][1]).toEqual(
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
        let trainArraysSpy: jest.SpyInstance;
        let predictTargetSpy: jest.SpyInstance;
        beforeEach(() => {
          trainArraysSpy = jest.spyOn(
            RNNTimeStep.prototype,
            'trainArrayOfArray'
          );
          predictTargetSpy = jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          trainArraysSpy.mockRestore();
          predictTargetSpy.mockRestore();
        });
        it('uses .trainArrays with correct arguments', () => {
          const net = new RNNTimeStep({
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
          expect(trainArraysSpy.mock.calls.length).toBe(1);
          expect(trainArraysSpy.mock.calls[0].length).toBe(1);
          expect(trainArraysSpy.mock.calls[0][0]).toEqual(
            trainingDataFormatted
          );
          expect(predictTargetSpy.mock.calls.length).toBe(4);
          expect(net.model.equations.length).toBe(5);

          // first array
          expect(predictTargetSpy.mock.calls[0][0]).toEqual(
            Float32Array.from([0.1, 0.5])
          );
          expect(predictTargetSpy.mock.calls[0][1]).toEqual(
            Float32Array.from([0.2, 0.4])
          );

          // second array
          expect(predictTargetSpy.mock.calls[1][0]).toEqual(
            Float32Array.from([0.2, 0.4])
          );
          expect(predictTargetSpy.mock.calls[1][1]).toEqual(
            Float32Array.from([0.3, 0.3])
          );

          // third array
          expect(predictTargetSpy.mock.calls[2][0]).toEqual(
            Float32Array.from([0.3, 0.3])
          );
          expect(predictTargetSpy.mock.calls[2][1]).toEqual(
            Float32Array.from([0.4, 0.2])
          );

          // forth array
          expect(predictTargetSpy.mock.calls[3][0]).toEqual(
            Float32Array.from([0.4, 0.2])
          );
          expect(predictTargetSpy.mock.calls[3][1]).toEqual(
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
        let trainArraysSpy: jest.SpyInstance;
        let predictTargetSpy: jest.SpyInstance;
        beforeEach(() => {
          trainArraysSpy = jest.spyOn(
            RNNTimeStep.prototype,
            'trainArrayOfArray'
          );
          predictTargetSpy = jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          trainArraysSpy.mockRestore();
          predictTargetSpy.mockRestore();
        });
        it('uses .trainArrays with correct arguments', () => {
          const net = new RNNTimeStep({
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
          expect(trainArraysSpy.mock.calls.length).toBe(2);
          expect(trainArraysSpy.mock.calls[0].length).toBe(1);
          expect(trainArraysSpy.mock.calls[0][0]).toEqual(
            trainingDataFormatted0
          );
          expect(trainArraysSpy.mock.calls[1][0]).toEqual(
            trainingDataFormatted1
          );
          expect(predictTargetSpy.mock.calls.length).toBe(8);
          expect(net.model.equations.length).toBe(5);

          // first set, first array
          expect(predictTargetSpy.mock.calls[0][0]).toEqual(
            Float32Array.from([0.1, 0.5])
          );
          expect(predictTargetSpy.mock.calls[0][1]).toEqual(
            Float32Array.from([0.2, 0.4])
          );

          // first set, second array
          expect(predictTargetSpy.mock.calls[1][0]).toEqual(
            Float32Array.from([0.2, 0.4])
          );
          expect(predictTargetSpy.mock.calls[1][1]).toEqual(
            Float32Array.from([0.3, 0.3])
          );

          // first set, third array
          expect(predictTargetSpy.mock.calls[2][0]).toEqual(
            Float32Array.from([0.3, 0.3])
          );
          expect(predictTargetSpy.mock.calls[2][1]).toEqual(
            Float32Array.from([0.4, 0.2])
          );

          // first set, forth array
          expect(predictTargetSpy.mock.calls[3][0]).toEqual(
            Float32Array.from([0.4, 0.2])
          );
          expect(predictTargetSpy.mock.calls[3][1]).toEqual(
            Float32Array.from([0.5, 0.1])
          );

          // second set, first array
          expect(predictTargetSpy.mock.calls[4][0]).toEqual(
            Float32Array.from([0.5, 0.9])
          );
          expect(predictTargetSpy.mock.calls[4][1]).toEqual(
            Float32Array.from([0.6, 0.8])
          );

          // second set, second array
          expect(predictTargetSpy.mock.calls[5][0]).toEqual(
            Float32Array.from([0.6, 0.8])
          );
          expect(predictTargetSpy.mock.calls[5][1]).toEqual(
            Float32Array.from([0.7, 0.7])
          );

          // second set, third array
          expect(predictTargetSpy.mock.calls[6][0]).toEqual(
            Float32Array.from([0.7, 0.7])
          );
          expect(predictTargetSpy.mock.calls[6][1]).toEqual(
            Float32Array.from([0.8, 0.6])
          );

          // second set, forth array
          expect(predictTargetSpy.mock.calls[7][0]).toEqual(
            Float32Array.from([0.8, 0.6])
          );
          expect(predictTargetSpy.mock.calls[7][1]).toEqual(
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
        let trainArraysSpy: jest.SpyInstance;
        let predictTargetSpy: jest.SpyInstance;
        beforeEach(() => {
          trainArraysSpy = jest.spyOn(
            RNNTimeStep.prototype,
            'trainArrayOfArray'
          );
          predictTargetSpy = jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          trainArraysSpy.mockRestore();
          predictTargetSpy.mockRestore();
        });
        it('uses .runInputOutput with correct arguments', () => {
          const net = new RNNTimeStep({
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
          expect(trainArraysSpy.mock.calls.length).toBe(2);
          expect(trainArraysSpy.mock.calls[0].length).toBe(1);
          expect(trainArraysSpy.mock.calls[0][0]).toEqual(
            [42, 44, 53, 64, 75, 83].map((v: number) => Float32Array.from([v]))
          );
          expect(trainArraysSpy.mock.calls[1][0]).toEqual(
            [44, 52, 63, 72, 82, 92].map((v: number) => Float32Array.from([v]))
          );
          expect(predictTargetSpy.mock.calls.length).toBe(10);
          expect(net.model.equations.length).toBe(6);

          // first array
          expect(predictTargetSpy.mock.calls[0][0]).toEqual(
            new Float32Array([42])
          );
          expect(predictTargetSpy.mock.calls[0][1]).toEqual(
            new Float32Array([44])
          );

          expect(predictTargetSpy.mock.calls[1][0]).toEqual(
            new Float32Array([44])
          );
          expect(predictTargetSpy.mock.calls[1][1]).toEqual(
            new Float32Array([53])
          );

          expect(predictTargetSpy.mock.calls[2][0]).toEqual(
            new Float32Array([53])
          );
          expect(predictTargetSpy.mock.calls[2][1]).toEqual(
            new Float32Array([64])
          );

          expect(predictTargetSpy.mock.calls[3][0]).toEqual(
            new Float32Array([64])
          );
          expect(predictTargetSpy.mock.calls[3][1]).toEqual(
            new Float32Array([75])
          );

          expect(predictTargetSpy.mock.calls[4][0]).toEqual(
            new Float32Array([75])
          );
          expect(predictTargetSpy.mock.calls[4][1]).toEqual(
            new Float32Array([83])
          );

          // second array
          expect(predictTargetSpy.mock.calls[5][0]).toEqual(
            new Float32Array([44])
          );
          expect(predictTargetSpy.mock.calls[5][1]).toEqual(
            new Float32Array([52])
          );

          expect(predictTargetSpy.mock.calls[6][0]).toEqual(
            new Float32Array([52])
          );
          expect(predictTargetSpy.mock.calls[6][1]).toEqual(
            new Float32Array([63])
          );

          expect(predictTargetSpy.mock.calls[7][0]).toEqual(
            new Float32Array([63])
          );
          expect(predictTargetSpy.mock.calls[7][1]).toEqual(
            new Float32Array([72])
          );

          expect(predictTargetSpy.mock.calls[8][0]).toEqual(
            new Float32Array([72])
          );
          expect(predictTargetSpy.mock.calls[8][1]).toEqual(
            new Float32Array([82])
          );

          expect(predictTargetSpy.mock.calls[9][0]).toEqual(
            new Float32Array([82])
          );
          expect(predictTargetSpy.mock.calls[9][1]).toEqual(
            new Float32Array([92])
          );
        });
      });
      describe('training data with 1D arrays', () => {
        let trainArraysSpy: jest.SpyInstance;
        let predictTargetSpy: jest.SpyInstance;
        beforeEach(() => {
          trainArraysSpy = jest.spyOn(
            RNNTimeStep.prototype,
            'trainArrayOfArray'
          );
          predictTargetSpy = jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          trainArraysSpy.mockRestore();
          predictTargetSpy.mockRestore();
        });
        it('uses .runInputOutput with correct arguments', () => {
          const net = new RNNTimeStep({
            inputSize: 1,
            hiddenLayers: [1],
            outputSize: 1,
          });
          const trainingData = [
            { input: [1, 2, 3, 4], output: [5] },
            { input: [5, 4, 3, 2], output: [1] },
          ];
          const trainingDataFormatted0 = [1, 2, 3, 4, 5].map((v: number) =>
            Float32Array.from([v])
          );
          const trainingDataFormatted1 = [5, 4, 3, 2, 1].map((v: number) =>
            Float32Array.from([v])
          );
          net.train(trainingData, { iterations: 1 });
          expect(trainArraysSpy.mock.calls.length).toBe(2);
          expect(trainArraysSpy.mock.calls[0].length).toBe(1);
          expect(trainArraysSpy.mock.calls[0][0]).toEqual(
            trainingDataFormatted0
          );
          expect(trainArraysSpy.mock.calls[1][0]).toEqual(
            trainingDataFormatted1
          );
          expect(predictTargetSpy.mock.calls.length).toBe(8);
          expect(net.model.equations.length).toBe(5);

          // first array
          expect(predictTargetSpy.mock.calls[0][0]).toEqual(
            Float32Array.from([1])
          );
          expect(predictTargetSpy.mock.calls[0][1]).toEqual(
            Float32Array.from([2])
          );

          expect(predictTargetSpy.mock.calls[1][0]).toEqual(
            Float32Array.from([2])
          );
          expect(predictTargetSpy.mock.calls[1][1]).toEqual(
            Float32Array.from([3])
          );

          expect(predictTargetSpy.mock.calls[2][0]).toEqual(
            Float32Array.from([3])
          );
          expect(predictTargetSpy.mock.calls[2][1]).toEqual(
            Float32Array.from([4])
          );

          expect(predictTargetSpy.mock.calls[3][0]).toEqual(
            Float32Array.from([4])
          );
          expect(predictTargetSpy.mock.calls[3][1]).toEqual(
            Float32Array.from([5])
          );

          // second array
          expect(predictTargetSpy.mock.calls[4][0]).toEqual(
            Float32Array.from([5])
          );
          expect(predictTargetSpy.mock.calls[4][1]).toEqual(
            Float32Array.from([4])
          );

          expect(predictTargetSpy.mock.calls[5][0]).toEqual(
            Float32Array.from([4])
          );
          expect(predictTargetSpy.mock.calls[5][1]).toEqual(
            Float32Array.from([3])
          );

          expect(predictTargetSpy.mock.calls[6][0]).toEqual(
            Float32Array.from([3])
          );
          expect(predictTargetSpy.mock.calls[6][1]).toEqual(
            Float32Array.from([2])
          );

          expect(predictTargetSpy.mock.calls[7][0]).toEqual(
            Float32Array.from([2])
          );
          expect(predictTargetSpy.mock.calls[7][1]).toEqual(
            Float32Array.from([1])
          );
        });
      });

      describe('training data with 2D arrays', () => {
        let trainArraysSpy: jest.SpyInstance;
        let predictTargetSpy: jest.SpyInstance;
        beforeEach(() => {
          trainArraysSpy = jest.spyOn(
            RNNTimeStep.prototype,
            'trainArrayOfArray'
          );
          predictTargetSpy = jest.spyOn(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          trainArraysSpy.mockRestore();
          predictTargetSpy.mockRestore();
        });
        it('uses .runInputOutputArray with correct arguments', () => {
          const net = new RNNTimeStep({
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
          const trainingDataFormatted0 = [
            ...trainingData[0].input.map((value) => Float32Array.from(value)),
            ...trainingData[0].output.map((value) => Float32Array.from(value)),
          ];
          const trainingDataFormatted1 = [
            ...trainingData[1].input.map((value) => Float32Array.from(value)),
            ...trainingData[1].output.map((value) => Float32Array.from(value)),
          ];
          net.train(trainingData, { iterations: 1 });
          expect(trainArraysSpy.mock.calls.length).toBe(2);
          expect(trainArraysSpy.mock.calls[0].length).toBe(1);
          expect(trainArraysSpy.mock.calls[0][0]).toEqual(
            trainingDataFormatted0
          );
          expect(trainArraysSpy.mock.calls[1][0]).toEqual(
            trainingDataFormatted1
          );
          expect(predictTargetSpy.mock.calls.length).toBe(8);
          expect(net.model.equations.length).toBe(5);

          // first set, first array
          expect(predictTargetSpy.mock.calls[0][0]).toEqual(
            Float32Array.from([0.1, 0.5])
          );
          expect(predictTargetSpy.mock.calls[0][1]).toEqual(
            Float32Array.from([0.2, 0.4])
          );

          // first set, second array
          expect(predictTargetSpy.mock.calls[1][0]).toEqual(
            Float32Array.from([0.2, 0.4])
          );
          expect(predictTargetSpy.mock.calls[1][1]).toEqual(
            Float32Array.from([0.3, 0.3])
          );

          // first set, third array
          expect(predictTargetSpy.mock.calls[2][0]).toEqual(
            Float32Array.from([0.3, 0.3])
          );
          expect(predictTargetSpy.mock.calls[2][1]).toEqual(
            Float32Array.from([0.4, 0.2])
          );

          // first set, forth array
          expect(predictTargetSpy.mock.calls[3][0]).toEqual(
            Float32Array.from([0.4, 0.2])
          );
          expect(predictTargetSpy.mock.calls[3][1]).toEqual(
            Float32Array.from([0.5, 0.1])
          );

          // second set, first array
          expect(predictTargetSpy.mock.calls[4][0]).toEqual(
            Float32Array.from([0.5, 0.9])
          );
          expect(predictTargetSpy.mock.calls[4][1]).toEqual(
            Float32Array.from([0.6, 0.8])
          );

          // second set, second array
          expect(predictTargetSpy.mock.calls[5][0]).toEqual(
            Float32Array.from([0.6, 0.8])
          );
          expect(predictTargetSpy.mock.calls[5][1]).toEqual(
            Float32Array.from([0.7, 0.7])
          );

          // second set, third array
          expect(predictTargetSpy.mock.calls[6][0]).toEqual(
            Float32Array.from([0.7, 0.7])
          );
          expect(predictTargetSpy.mock.calls[6][1]).toEqual(
            Float32Array.from([0.8, 0.6])
          );

          // second set, forth array
          expect(predictTargetSpy.mock.calls[7][0]).toEqual(
            Float32Array.from([0.8, 0.6])
          );
          expect(predictTargetSpy.mock.calls[7][1]).toEqual(
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
          const washington = net.runObject({
            jan: 0.42,
            feb: 0.44,
            mar: 0.53,
            apr: 0.64,
          });
          const bluff = net.runObject({
            jan: 0.44,
            feb: 0.52,
            mar: 0.63,
            apr: 0.72,
          });
          expect(result.error).toBeLessThan(0.05);

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
  describe('.trainArrayOfArray()', () => {
    describe('when preparing equation length', () => {
      let bindEquationSpy: jest.SpyInstance;
      beforeEach(() => {
        bindEquationSpy = jest.spyOn(RNNTimeStep.prototype, 'bindEquation');
      });
      afterEach(() => {
        bindEquationSpy.mockRestore();
      });
      it('calls .bindEquation() to match the input length', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 1 });
        net.initialize();
        net.trainArrayOfArray([
          Float32Array.from([1]),
          Float32Array.from([1]),
          Float32Array.from([1]),
        ]);
        expect(bindEquationSpy).toHaveBeenCalledTimes(3);
      });
    });
    describe('when reading in input', () => {
      let predictTargetSpy: jest.SpyInstance;
      beforeEach(() => {
        predictTargetSpy = jest.spyOn(Equation.prototype, 'predictTarget');
      });
      afterEach(() => {
        predictTargetSpy.mockRestore();
      });
      it('calls .predictTarget() with expected current and next values from input argument', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 1 });
        net.initialize();
        net.trainArrayOfArray([
          Float32Array.from([1]),
          Float32Array.from([2]),
          Float32Array.from([3]),
        ]);
        expect(predictTargetSpy.mock.calls.length).toBe(2);
        expect(predictTargetSpy.mock.calls[0]).toEqual([
          Float32Array.from([1]),
          Float32Array.from([2]),
        ]);
        expect(predictTargetSpy.mock.calls[1]).toEqual([
          Float32Array.from([2]),
          Float32Array.from([3]),
        ]);
      });
    });
    describe('after reading in input', () => {
      let endSpy: jest.SpyInstance;
      beforeEach(() => {
        endSpy = jest.spyOn(RNNTimeStep.prototype, 'end');
      });
      afterEach(() => {
        endSpy.mockRestore();
      });
      it('calls .end()', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 1 });
        net.initialize();
        net.trainArrayOfArray([Float32Array.from([1]), Float32Array.from([1])]);
        expect(endSpy).toHaveBeenCalledTimes(1);
      });
    });
    describe('when given an array of length less than 2', () => {
      it('throws with descriptive message', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 1 });
        net.initialize();
        expect(() => {
          net.trainArrayOfArray([Float32Array.from([1])]);
        }).toThrow('input must be an array of 2 or more');
      });
    });
    it('returns a number that is the error', () => {
      const net = new RNNTimeStep({ inputSize: 1, outputSize: 1 });
      net.initialize();
      const error = net.trainArrayOfArray([
        Float32Array.from([1]),
        Float32Array.from([2]),
      ]);
      expect(error).toBeGreaterThan(0);
    });
  });

  describe('.forecastArray()', () => {
    it('returns null when this.isRunnable returns false', () => {
      expect(() => {
        new RNNTimeStep().forecastArray(Float32Array.from([1]));
      }).toThrow();
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
      net.forecastArray(Float32Array.from([1, 2, 3]), 2);
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
      net.forecastArray(Float32Array.from([1, 2, 3]), 2);
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
      const result = net.forecastArray(Float32Array.from([1, 2, 3]), 2);
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
      const result = net.forecastArray(Float32Array.from([1, 2, 3]), 2);
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('number');
    });
  });
  describe('.forecastArrayOfArray', () => {
    it('returns null when this.isRunnable returns false', () => {
      expect(() => {
        new RNNTimeStep().forecastArrayOfArray([Float32Array.from([1])]);
      }).toThrow();
    });
    it('sets up equations for length of input plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 3,
        hiddenLayers: [1],
        outputSize: 3,
      });
      net.initialize();
      net.bindEquation();
      expect(net.model.equations.length).toBe(1);
      net.forecastArrayOfArray([Float32Array.from([1, 2, 3])], 2);
      expect(net.model.equations.length).toBe(4);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 3,
        hiddenLayers: [1],
        outputSize: 3,
      });
      const stub = (net.end = jest.fn());
      net.initialize();
      net.bindEquation();
      net.forecastArrayOfArray([Float32Array.from([1, 2, 3])], 2);
      expect(stub).toBeCalled();
    });
    it('outputs the length of required forecast', () => {
      const net = new RNNTimeStep({
        inputSize: 3,
        hiddenLayers: [1],
        outputSize: 3,
      });
      net.initialize();
      net.bindEquation();
      const result = net.forecastArrayOfArray(
        [Float32Array.from([1, 2, 3])],
        2
      );
      expect(result.length).toBe(2);
    });
    it('outputs a nested array of numbers', () => {
      const net = new RNNTimeStep({
        inputSize: 3,
        hiddenLayers: [1],
        outputSize: 3,
      });
      net.initialize();
      net.bindEquation();
      const result = net.forecastArrayOfArray(
        [Float32Array.from([1, 2, 3])],
        2
      );
      expect(result.length).toBe(2);
      expect(result[0].length).toBe(3);
      expect(result[1].length).toBe(3);
      expect(typeof result[0][0]).toBe('number');
      expect(typeof result[0][1]).toBe('number');
      expect(typeof result[0][2]).toBe('number');
      expect(typeof result[1][0]).toBe('number');
      expect(typeof result[1][1]).toBe('number');
      expect(typeof result[1][2]).toBe('number');
    });
  });
  describe('.forecastArrayOfObject()', () => {
    let forecastArrayObjectSpy: jest.SpyInstance;
    beforeEach(() => {
      forecastArrayObjectSpy = jest.spyOn(
        RNNTimeStep.prototype,
        'forecastArrayOfObject'
      );
    });
    afterEach(() => {
      forecastArrayObjectSpy.mockRestore();
    });
    it('maps values correctly', () => {
      const trainingData = [
        [
          { low: 0.1, high: 0.9 },
          { low: 0.2, high: 0.8 },
          { low: 0.3, high: 0.7 },
        ],
        [
          { low: 0.9, high: 0.1 },
          { low: 0.8, high: 0.2 },
          { low: 0.7, high: 0.3 },
        ],
      ];
      const net = new RNNTimeStep({
        inputSize: 2,
        outputSize: 2,
      });
      net.train(trainingData, { iterations: 1000, log: true });
      const result = net.forecast([{ low: 0.1, high: 0.9 }], 2);
      expect(result.length).toBe(2);
      expect(result[0].low).toBeGreaterThan(0);
      expect(result[0].high).toBeGreaterThan(0);
      expect(result[1].low).toBeGreaterThan(0);
      expect(result[1].high).toBeGreaterThan(0);
    });
  });

  describe('.forecast()', () => {
    describe('when called with unrecognized data shape', () => {
      it('throws', () => {
        expect(() => {
          const net = new RNNTimeStep();
          net.train([[1, 2, 3]], { iterations: 1 });
          // @ts-expect-error need to infer types
          net.forecast({ one: [1] }, 2);
        }).toThrow('Unrecognized data shape object,array,number');
      });
    });
    describe('when called with array,number', () => {
      let forecastArraysSpy: jest.SpyInstance;
      beforeEach(() => {
        forecastArraysSpy = jest.spyOn(RNNTimeStep.prototype, 'forecastArray');
      });
      afterEach(() => {
        forecastArraysSpy.mockRestore();
      });
      it('calls this.forecastArray with input and count', () => {
        const net = new RNNTimeStep();
        net.train([[1, 2, 3]], { iterations: 1 });
        net.forecast([1], 2);
        expect(forecastArraysSpy).toBeCalledWith([1], 2);
      });
    });
    describe('when called with array,array,number', () => {
      let forecastArraysOfArraySpy: jest.SpyInstance;
      beforeEach(() => {
        forecastArraysOfArraySpy = jest.spyOn(
          RNNTimeStep.prototype,
          'forecastArrayOfArray'
        );
      });
      afterEach(() => {
        forecastArraysOfArraySpy.mockRestore();
      });
      it('calls this.forecastArrayOfArray with input and count', () => {
        const net = new RNNTimeStep();
        net.train(
          [
            [
              [1, 2, 3],
              [4, 5, 6],
              [7, 8, 9],
            ],
          ],
          { iterations: 1 }
        );
        net.forecast([[1, 2, 3]], 2);
        expect(forecastArraysOfArraySpy).toBeCalledWith([[1, 2, 3]], 2);
      });
    });
    describe('when called with array,object,number', () => {
      let forecastArrayOfObjectSpy: jest.SpyInstance;
      beforeEach(() => {
        forecastArrayOfObjectSpy = jest.spyOn(
          RNNTimeStep.prototype,
          'forecastArrayOfObject'
        );
      });
      afterEach(() => {
        forecastArrayOfObjectSpy.mockRestore();
      });
      it('calls this.forecastArrayOfObject with input and count', () => {
        const net = new RNNTimeStep();
        net.train(
          [
            [
              { low: 1, high: 2, med: 3 },
              { low: 4, high: 5, med: 6 },
              { low: 7, high: 8, med: 9 },
            ],
          ],
          { iterations: 1 }
        );
        net.forecast([{ low: 1, high: 2, med: 3 }], 2);
        expect(forecastArrayOfObjectSpy).toBeCalledWith(
          [{ low: 1, high: 2, med: 3 }],
          2
        );
      });
    });
  });
  describe('.formatData()', () => {
    describe('when called with array,number data shape', () => {
      let formatArraySpy: jest.SpyInstance;
      beforeEach(() => {
        formatArraySpy = jest.spyOn(RNNTimeStep.prototype, 'formatArray');
      });
      afterEach(() => {
        formatArraySpy.mockRestore();
      });
      it('calls this.formatNumber with data', () => {
        const net = new RNNTimeStep();
        const data = [1];
        net.formatData(data);
        expect(formatArraySpy).toHaveBeenCalledWith(data);
      });
    });
    describe('when called with array,array,number data shape', () => {
      let formatArrayOfArraySpy: jest.SpyInstance;
      beforeEach(() => {
        formatArrayOfArraySpy = jest.spyOn(
          RNNTimeStep.prototype,
          'formatArrayOfArray'
        );
      });
      afterEach(() => {
        formatArrayOfArraySpy.mockRestore();
      });
      it('calls this.formatArrayOfArray with data', () => {
        const net = new RNNTimeStep({ inputSize: 1 });
        const data = [[1]];
        net.formatData(data);
        expect(formatArrayOfArraySpy).toHaveBeenCalledWith(data);
      });
    });
    describe('when called with array,object,number data shape', () => {
      describe('when this.inputSize = 1', () => {
        let formatArrayOfObjectSpy: jest.SpyInstance;
        beforeEach(() => {
          formatArrayOfObjectSpy = jest.spyOn(
            RNNTimeStep.prototype,
            'formatArrayOfObject'
          );
        });
        afterEach(() => {
          formatArrayOfObjectSpy.mockRestore();
        });
        it('calls this.formatArrayOfObject with data', () => {
          const net = new RNNTimeStep({ inputSize: 1 });
          const data = [{ low: 1, high: 2 }];
          net.formatData(data);
          expect(formatArrayOfObjectSpy).toHaveBeenCalledWith(data);
        });
      });
      describe('when this.inputSize > 1', () => {
        let formatArrayOfObjectMultiSpy: jest.SpyInstance;
        beforeEach(() => {
          formatArrayOfObjectMultiSpy = jest.spyOn(
            RNNTimeStep.prototype,
            'formatArrayOfObjectMulti'
          );
        });
        afterEach(() => {
          formatArrayOfObjectMultiSpy.mockRestore();
        });
        it('calls this.formatArrayOfObjectMulti with data', () => {
          const net = new RNNTimeStep({ inputSize: 2 });
          const data = [{ low: 1, high: 2 }];
          net.formatData(data);
          expect(formatArrayOfObjectMultiSpy).toHaveBeenCalledWith(data);
        });
      });
    });
    describe('when called with array,datum,array,number data shape', () => {
      let formatArrayOfDatumOfArraySpy: jest.SpyInstance;
      beforeEach(() => {
        formatArrayOfDatumOfArraySpy = jest.spyOn(
          RNNTimeStep.prototype,
          'formatArrayOfDatumOfArray'
        );
      });
      afterEach(() => {
        formatArrayOfDatumOfArraySpy.mockRestore();
      });
      it('calls this.formatArrayOfDatumOfArray with data', () => {
        const net = new RNNTimeStep();
        const data = [
          {
            input: [1, 2],
            output: [3, 4],
          },
        ];
        net.formatData(data);
        expect(formatArrayOfDatumOfArraySpy).toHaveBeenCalledWith(data);
      });
    });
    describe('when called with array,datum,object,number data shape', () => {
      let formatArrayOfDatumOfObjectSpy: jest.SpyInstance;
      beforeEach(() => {
        formatArrayOfDatumOfObjectSpy = jest.spyOn(
          RNNTimeStep.prototype,
          'formatArrayOfDatumOfObject'
        );
      });
      afterEach(() => {
        formatArrayOfDatumOfObjectSpy.mockRestore();
      });
      it('calls this.formatArrayOfDatumOfArray with data', () => {
        const net = new RNNTimeStep();
        const data = [
          {
            input: { low: 1, high: 2 },
            output: { low: 3, high: 4 },
          },
        ];
        net.formatData(data);
        expect(formatArrayOfDatumOfObjectSpy).toHaveBeenCalledWith(data);
      });
    });
    describe('when called with array,array,array,number data shape', () => {
      let formatArrayOfArrayOfArraySpy: jest.SpyInstance;
      beforeEach(() => {
        formatArrayOfArrayOfArraySpy = jest.spyOn(
          RNNTimeStep.prototype,
          'formatArrayOfArrayOfArray'
        );
      });
      afterEach(() => {
        formatArrayOfArrayOfArraySpy.mockRestore();
      });
      it('calls this.formatArrayOfArrayOfArray with data', () => {
        const net = new RNNTimeStep();
        const data = [[[1, 2, 3]], [[3, 4, 5]]];
        net.formatData(data);
        expect(formatArrayOfArrayOfArraySpy).toHaveBeenCalledWith(data);
      });
    });
    describe('when called with array,array,object,number data shape', () => {
      let formatArrayOfArrayOfObjectSpy: jest.SpyInstance;
      beforeEach(() => {
        formatArrayOfArrayOfObjectSpy = jest.spyOn(
          RNNTimeStep.prototype,
          'formatArrayOfArrayOfObject'
        );
      });
      afterEach(() => {
        formatArrayOfArrayOfObjectSpy.mockRestore();
      });
      it('calls this.formatArrayOfArrayOfObject with data', () => {
        const net = new RNNTimeStep();
        const data = [
          [
            { h: 1, l: 2, m: 3 },
            { h: 3, l: 2, m: 3 },
          ],
          [
            { h: 3, l: 4, m: 5 },
            { h: 4, l: 4, m: 4 },
          ],
        ];
        net.formatData(data);
        expect(formatArrayOfArrayOfObjectSpy).toHaveBeenCalledWith(data);
      });
    });
    describe('when called with array,datum,array,array,number data shape', () => {
      let formatArrayOfDatumOfArrayOfArraySpy: jest.SpyInstance;
      beforeEach(() => {
        formatArrayOfDatumOfArrayOfArraySpy = jest.spyOn(
          RNNTimeStep.prototype,
          'formatArrayOfDatumOfArrayOfArray'
        );
      });
      afterEach(() => {
        formatArrayOfDatumOfArrayOfArraySpy.mockRestore();
      });
      it('calls this.formatArrayOfArrayOfObject with data', () => {
        const net = new RNNTimeStep({
          inputSize: 2,
          outputSize: 2,
        });
        const data = [
          {
            input: [
              [1, 2],
              [3, 4],
            ],
            output: [
              [3, 4],
              [2, 1],
            ],
          },
        ];
        net.formatData(data);
        expect(formatArrayOfDatumOfArrayOfArraySpy).toHaveBeenCalledWith(data);
      });
    });
    describe('when called with array,datum,array,object,number data shape', () => {
      let formatArrayOfDatumOfArrayOfObjectSpy: jest.SpyInstance;
      beforeEach(() => {
        formatArrayOfDatumOfArrayOfObjectSpy = jest.spyOn(
          RNNTimeStep.prototype,
          'formatArrayOfDatumOfArrayOfObject'
        );
      });
      afterEach(() => {
        formatArrayOfDatumOfArrayOfObjectSpy.mockRestore();
      });
      it('calls this.formatArrayOfDatumOfArrayOfObject with data', () => {
        const net = new RNNTimeStep();
        const data = [
          {
            input: [
              { h: 1, l: 2 },
              { h: 1, l: 2 },
            ],
            output: [
              { h: 2, l: 1 },
              { h: 2, l: 1 },
            ],
          },
        ];
        net.formatData(data);
        expect(formatArrayOfDatumOfArrayOfObjectSpy).toHaveBeenCalledWith(data);
      });
    });
  });
  describe('.formatArray()', () => {
    it('returns a proper Float32Array[][]', () => {
      const net = new RNNTimeStep();
      const result = net.formatArray([1, 2, 3]);
      expect(result).toEqual([
        [[1], [2], [3]].map((v) => Float32Array.from(v)),
      ]);
    });
  });
  describe('.formatArrayOfArray()', () => {
    describe('when this.options.inputSize and this.options.outputSize = 1', () => {
      it('returns a proper Float32Array[][]', () => {
        const net = new RNNTimeStep();
        const result = net.formatArrayOfArray([[1, 2, 3]]);
        expect(result).toEqual([
          [[1], [2], [3]].map((v) => Float32Array.from(v)),
        ]);
      });
    });
    describe('when this.options.inputSize and this.options.outputSize > 1', () => {
      describe('when inputSize does not match data length', () => {
        const net = new RNNTimeStep({ inputSize: 2, outputSize: 3 });
        it('throws', () => {
          expect(() => {
            net.formatArrayOfArray([[1, 2, 3]]);
          }).toThrow('inputSize must match data input size');
        });
      });
      describe('when outputSize does not match data length', () => {
        const net = new RNNTimeStep({ inputSize: 3, outputSize: 2 });
        it('throws', () => {
          expect(() => {
            net.formatArrayOfArray([[1, 2, 3]]);
          }).toThrow('outputSize must match data output size');
        });
      });
      it('returns a proper Float32Array[][]', () => {
        const net = new RNNTimeStep({ inputSize: 3, outputSize: 3 });
        const result = net.formatArrayOfArray([[1, 2, 3]]);
        expect(result).toEqual([[[1, 2, 3]].map((v) => Float32Array.from(v))]);
      });
    });
  });
  describe('.formatArrayOfObject()', () => {
    describe('when this.options.inputSize > 1', () => {
      it('throws', () => {
        const net = new RNNTimeStep({ inputSize: 2, outputSize: 1 });
        expect(() => {
          net.formatArrayOfObject([{ a: 1 }]);
        }).toThrow('inputSize must be 1 for this data size');
      });
    });
    describe('when this.options.outputSize > 1', () => {
      it('throws', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 2 });
        expect(() => {
          net.formatArrayOfObject([{ a: 1 }]);
        }).toThrow('outputSize must be 1 for this data size');
      });
    });
    describe('when this.inputLookup is null', () => {
      it('sets this.inputLookup & this.inputLookupLength', () => {
        const net = new RNNTimeStep();
        expect(net.inputLookup).toBe(null);
        expect(net.inputLookupLength).toBe(0);
        net.formatArrayOfObject([{ a: 1 }]);
        expect(net.inputLookup).toEqual({ a: 0 });
        expect(net.inputLookupLength).toBe(1);
      });
    });
    describe('when this.inputLookup is set', () => {
      it('does not set this.inputLookup or this.inputLookupLength', () => {
        const net = new RNNTimeStep();
        const inputLookup = { a: 0 };
        net.inputLookup = inputLookup;
        net.inputLookupLength = 2;
        net.formatArrayOfObject([{ a: 1 }]);
        expect(net.inputLookup).toBe(inputLookup);
        expect(net.inputLookupLength).toBe(2);
      });
    });
    it('returns a proper Float32Array[][]', () => {
      const net = new RNNTimeStep();
      const result = net.formatArrayOfObject([{ one: 1, two: 2, three: 3 }]);
      expect(result).toEqual([
        [[1], [2], [3]].map((v) => Float32Array.from(v)),
      ]);
    });
  });
  describe('.formatArrayOfObjectMulti()', () => {
    describe('when this.inputLookup is null', () => {
      it('sets this.inputLookup & this.inputLookupLength', () => {
        const net = new RNNTimeStep();
        expect(net.inputLookup).toBe(null);
        expect(net.inputLookupLength).toBe(0);
        net.formatArrayOfObjectMulti([{ a: 1, b: 2 }]);
        expect(net.inputLookup).toEqual({ a: 0, b: 1 });
        expect(net.inputLookupLength).toBe(2);
      });
    });
    describe('when this.inputLookup is set', () => {
      it('does not set this.inputLookup or this.inputLookupLength', () => {
        const net = new RNNTimeStep();
        const inputLookup = { a: 0, b: 1 };
        net.inputLookup = inputLookup;
        net.inputLookupLength = 3;
        net.formatArrayOfObjectMulti([{ a: 1, b: 2 }]);
        expect(net.inputLookup).toBe(inputLookup);
        expect(net.inputLookupLength).toBe(3);
      });
    });
    it('returns a proper Float32Array[][]', () => {
      const net = new RNNTimeStep();
      const result = net.formatArrayOfObjectMulti([
        { one: 1, two: 2, three: 3 },
      ]);
      expect(result).toEqual([[Float32Array.from([1, 2, 3])]]);
    });
  });
  describe('.formatArrayOfDatumOfArray()', () => {
    describe('when this.options.inputSize > 1', () => {
      it('throws', () => {
        const net = new RNNTimeStep({ inputSize: 2, outputSize: 1 });
        expect(() => {
          net.formatArrayOfDatumOfArray([]);
        }).toThrow('inputSize must be 1 for this data size');
      });
    });
    describe('when this.options.outputSize > 1', () => {
      it('throws', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 2 });
        expect(() => {
          net.formatArrayOfDatumOfArray([]);
        }).toThrow('outputSize must be 1 for this data size');
      });
    });
    it('returns a proper Float32Array[][]', () => {
      const net = new RNNTimeStep();
      const result = net.formatArrayOfDatumOfArray([
        { input: [1, 2, 3], output: [4, 5, 6] },
      ]);
      expect(result).toEqual([
        [[1], [2], [3], [4], [5], [6]].map((v) => Float32Array.from(v)),
      ]);
    });
  });
  describe('.formatArrayOfDatumOfObject()', () => {
    describe('when this.options.inputSize > 1', () => {
      it('throws', () => {
        const net = new RNNTimeStep({ inputSize: 2, outputSize: 1 });
        expect(() => {
          net.formatArrayOfDatumOfObject([]);
        }).toThrow('inputSize must be 1 for this data size');
      });
    });
    describe('when this.options.outputSize > 1', () => {
      it('throws', () => {
        const net = new RNNTimeStep({ inputSize: 1, outputSize: 2 });
        expect(() => {
          net.formatArrayOfDatumOfObject([]);
        }).toThrow('outputSize must be 1 for this data size');
      });
    });
    describe('when this.inputLookup is null', () => {
      it('sets this.inputLookup & this.inputLookupLength', () => {
        const net = new RNNTimeStep();
        expect(net.inputLookup).toBe(null);
        expect(net.inputLookupLength).toBe(0);
        net.formatArrayOfDatumOfObject([
          {
            input: { a: 1, b: 2 },
            output: { a: 1, b: 2 },
          },
        ]);
        expect(net.inputLookup).toEqual({ a: 0, b: 1 });
        expect(net.inputLookupLength).toBe(2);
      });
    });
    describe('when this.inputLookup is set', () => {
      it('does not set this.inputLookup or this.inputLookupLength', () => {
        const net = new RNNTimeStep();
        const inputLookup = { a: 0, b: 1 };
        net.inputLookup = inputLookup;
        net.inputLookupLength = 3;
        net.formatArrayOfDatumOfObject([
          {
            input: { a: 1, b: 2 },
            output: { a: 1, b: 2 },
          },
        ]);
        expect(net.inputLookup).toBe(inputLookup);
        expect(net.inputLookupLength).toBe(3);
      });
    });
    it('returns a proper Float32Array[][]', () => {
      const net = new RNNTimeStep();
      const result = net.formatArrayOfDatumOfObject([
        { input: { a: 1, b: 2 }, output: { a: 1, b: 2 } },
      ]);
      expect(result).toEqual([
        [[1], [2], [1], [2]].map((v) => Float32Array.from(v)),
      ]);
    });
  });
  describe('.formatArrayOfArrayOfArray()', () => {
    it('returns a proper Float32Array[][]', () => {
      const net = new RNNTimeStep();
      const result = net.formatArrayOfArrayOfArray([
        [
          [1, 2, 3, 4],
          [4, 3, 2, 1],
        ],
      ]);
      expect(result).toEqual([
        [
          [1, 2, 3, 4],
          [4, 3, 2, 1],
        ].map((v) => Float32Array.from(v)),
      ]);
    });
  });
  describe('.formatArrayOfArrayOfObject()', () => {
    describe('when this.inputLookup is null', () => {
      it('sets this.inputLookup & this.inputLookupLength', () => {
        const net = new RNNTimeStep();
        expect(net.inputLookup).toBe(null);
        expect(net.inputLookupLength).toBe(0);
        net.formatArrayOfArrayOfObject([
          [
            { a: 1, b: 2 },
            { a: 2, b: 1 },
          ],
        ]);
        expect(net.inputLookup).toEqual({ a: 0, b: 1 });
        expect(net.inputLookupLength).toBe(2);
      });
    });
    describe('when this.inputLookup is set', () => {
      it('does not set this.inputLookup or this.inputLookupLength', () => {
        const net = new RNNTimeStep();
        const inputLookup = { a: 0, b: 1 };
        net.inputLookup = inputLookup;
        net.inputLookupLength = 3;
        net.formatArrayOfArrayOfObject([
          [
            { a: 1, b: 2 },
            { a: 2, b: 1 },
          ],
        ]);
        expect(net.inputLookup).toBe(inputLookup);
        expect(net.inputLookupLength).toBe(3);
      });
    });
    it('returns a proper Float32Array[][]', () => {
      const net = new RNNTimeStep();
      const result = net.formatArrayOfArrayOfObject([
        [
          { a: 1, b: 2 },
          { a: 2, b: 1 },
        ],
      ]);
      expect(result).toEqual([
        [
          [1, 2],
          [2, 1],
        ].map((v) => Float32Array.from(v)),
      ]);
    });
  });
  describe('.formatArrayOfDatumOfArrayOfArray()', () => {
    describe('when inputSize does not match data length', () => {
      const net = new RNNTimeStep({ inputSize: 2, outputSize: 3 });
      it('throws', () => {
        expect(() => {
          net.formatArrayOfDatumOfArrayOfArray([
            { input: [[1, 2, 3]], output: [[1, 2, 3]] },
          ]);
        }).toThrow('inputSize must match data input size');
      });
    });
    describe('when outputSize does not match data length', () => {
      const net = new RNNTimeStep({ inputSize: 3, outputSize: 2 });
      it('throws', () => {
        expect(() => {
          net.formatArrayOfDatumOfArrayOfArray([
            { input: [[1, 2, 3]], output: [[1, 2, 3]] },
          ]);
        }).toThrow('outputSize must match data output size');
      });
    });
    it('returns a proper Float32Array[][]', () => {
      const net = new RNNTimeStep({ inputSize: 2, outputSize: 2 });
      const result = net.formatArrayOfDatumOfArrayOfArray([
        {
          input: [
            [1, 2],
            [3, 4],
          ],
          output: [
            [4, 3],
            [2, 1],
          ],
        },
        {
          input: [
            [4, 3],
            [2, 1],
          ],
          output: [
            [1, 2],
            [3, 4],
          ],
        },
      ]);
      expect(result).toEqual([
        [
          [1, 2],
          [3, 4],
          [4, 3],
          [2, 1],
        ].map((v) => Float32Array.from(v)),
        [
          [4, 3],
          [2, 1],
          [1, 2],
          [3, 4],
        ].map((v) => Float32Array.from(v)),
      ]);
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
      net.train(data, { iterations: 100, errorThresh: 0.05 });
      const fn = net.toFunction();
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
      net.train(data, { iterations: 100, errorThresh: 0.05 });
      const fn = net.toFunction();
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
      net.train(data, { iterations: 100, errorThresh: 0.05 });
      const fn = net.toFunction();
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
      const fn = net.toFunction();
      expect(closeToFive.toFixed(1)).toBe('0.5');
      expect(closeToOne.toFixed(1)).toBe('0.1');
      expect(fn([0.1, 0.2, 0.3, 0.4])).toBeCloseTo(closeToFive);
      expect(fn([0.5, 0.4, 0.3, 0.2])).toBeCloseTo(closeToOne);
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
      const fn = net.toFunction();
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
      const closeToFive = net.runObject({
        monday: 0.1,
        tuesday: 0.2,
        wednesday: 0.3,
        thursday: 0.4,
      });
      const closeToOne = net.runObject({
        monday: 0.5,
        tuesday: 0.4,
        wednesday: 0.3,
        thursday: 0.2,
      });
      const fn = net.toFunction();
      expect(closeToFive.friday.toFixed(1)).toBe('0.5');
      expect(closeToOne.friday.toFixed(1)).toBe('0.1');
      expect(
        (fn as (input: INumberHash) => INumberHash)({
          monday: 0.1,
          tuesday: 0.2,
          wednesday: 0.3,
          thursday: 0.4,
        }).friday
      ).toBe(closeToFive.friday);
      expect(
        (fn as (input: INumberHash) => INumberHash)({
          monday: 0.5,
          tuesday: 0.4,
          wednesday: 0.3,
          thursday: 0.2,
        }).friday
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
      const fn = net.toFunction();
      const result = (fn as (input: INumberHash) => INumberHash)({
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
      });
      expect(result).toEqual(
        net.run({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 })
      );
      expect(Object.keys(result).length).toBe(1);
      expect(result.friday.toFixed(0)).toBe('5');
    });
  });
  describe('.test()', () => {
    let runSpy: jest.SpyInstance;
    beforeEach(() => {
      runSpy = jest.spyOn(LSTMTimeStep.prototype, 'run');
    });
    afterEach(() => {
      runSpy.mockRestore();
    });
    describe('with any data shape', () => {
      let formatDataSpy: jest.SpyInstance;
      beforeEach(() => {
        formatDataSpy = jest.spyOn(RNNTimeStep.prototype, 'formatData');
      });
      afterEach(() => {
        formatDataSpy.mockRestore();
      });
      it('calls .formatData()', () => {
        const data = [[1, 2]];
        const net = new RNNTimeStep();
        net.train(data);
        formatDataSpy.mockClear();
        net.test(data);
        expect(formatDataSpy).toHaveBeenCalledWith(data);
      });
    });
    describe('using array,array,number', () => {
      const trainingData = [[0.1, 0.2, 0.3, 0.4, 0.5]];
      describe('inputSize of 1', () => {
        it('accumulates no error or misclasses when no error', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          net.train(trainingData, { iterations: 500 });
          const testResult = net.test(trainingData);
          expect(testResult.error).toBeLessThan(0.001);
          expect(testResult.misclasses.length).toBe(0);
        });
        it('accumulates error and misclasses when error', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          net.train(trainingData, { iterations: 500 });
          const misclass = [1, 2, 3, 4, 5];
          const testResult = net.test([misclass]);
          expect(testResult.error).toBeGreaterThan(0.1);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              value: misclass,
              actual: runSpy.mock.results[0].value,
            },
          ]);
        });
      });
      describe('inputSize of 2', () => {
        it('throws', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 5,
          });
          expect(() => {
            net.test(trainingData);
          }).toThrow('inputSize must match data input size');
        });
      });
      describe('outputSize of 2', () => {
        it('throws', () => {
          const net = new LSTMTimeStep({
            inputSize: 5,
            hiddenLayers: [10],
            outputSize: 2,
          });
          expect(() => {
            net.test(trainingData);
          }).toThrow('outputSize must match data output size');
        });
      });
    });
    describe('using array,array,array,number', () => {
      const trainingData = [
        [
          [0.1, 0.5],
          [0.2, 0.4],
          [0.3, 0.3],
          [0.4, 0.2],
          [0.5, 0.1],
        ],
      ];
      describe('inputSize of 2', () => {
        describe('no error', () => {
          it('can test', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2,
            });
            net.train(trainingData, { iterations: 500 });
            const testResult = net.test(trainingData);
            expect(testResult.error).toBeLessThan(0.001);
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
            net.train(trainingData, { iterations: 500 });
            const misclass = [
              [1, 5],
              [2, 4],
              [3, 3],
              [4, 2],
              [5, 1],
            ];
            const testResult = net.test([misclass]);
            expect(testResult.error).toBeGreaterThanOrEqual(0.1);
            expect(testResult.misclasses.length).toBe(1);
            expect(testResult.misclasses).toEqual([
              {
                value: misclass,
                actual: runSpy.mock.results[0].value,
              },
            ]);
          });
        });
      });
    });
    describe('using array,object,number', () => {
      const trainingData = [
        {
          monday: 0.1,
          tuesday: 0.1,
          wednesday: 0.2,
          thursday: 0.3,
          friday: 0.4,
        },
      ];
      describe('inputSize of 1', () => {
        describe('no error', () => {
          it('can test w/ forecastNumbers of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [10],
              outputSize: 1,
            });
            net.train(trainingData, { iterations: 500 });
            const testResult = net.test(trainingData);
            expect(testResult.error).toBeLessThan(0.001);
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
            net.train(trainingData, { iterations: 500 });
            const misclass = {
              monday: 1,
              tuesday: 2,
              wednesday: 3,
              thursday: 4,
              friday: 5,
            };
            const testResult = net.test([misclass]);
            expect(testResult.error).toBeGreaterThanOrEqual(0.08);
            expect(testResult.misclasses.length).toBe(1);
            expect(testResult.misclasses).toEqual([
              {
                value: misclass,
                actual: runSpy.mock.results[0].value,
              },
            ]);
          });
        });
      });
    });
    describe('using array,array,object,number', () => {
      const trainingData = [
        [
          { low: 0.1, high: 0.5 },
          { low: 0.2, high: 0.4 },
          { low: 0.3, high: 0.3 },
          { low: 0.4, high: 0.2 },
          { low: 0.5, high: 0.1 },
        ],
      ];
      describe('inputSize of 2', () => {
        describe('no error', () => {
          it('can test w/ run of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2,
            });
            net.train(trainingData);
            const testResult = net.test(trainingData);
            expect(testResult.error).toBeLessThan(0.001);
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
            net.train(trainingData, { iterations: 500 });
            const misclass = [
              { low: 1, high: 5 },
              { low: 2, high: 4 },
              { low: 3, high: 3 },
              { low: 4, high: 2 },
              { low: 5, high: 1 },
            ];
            const testResult = net.test([misclass]);

            expect(testResult.error).toBeGreaterThan(0.3);
            expect(testResult.misclasses.length).toBe(1);
            expect(testResult.misclasses).toEqual([
              {
                value: misclass,
                actual: runSpy.mock.results[0].value,
              },
            ]);
          });
        });
      });
    });
    describe('using array,datum,array,number', () => {
      const trainingData = [{ input: [0.1, 0.2, 0.3, 0.4], output: [0.5] }];
      describe('no error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1,
          });
          net.train(trainingData, { iterations: 500 });
          const testResult = net.test(trainingData);
          expect(testResult.error).toBeLessThan(0.001);
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
          net.train(trainingData, { iterations: 500 });
          const misclass = { input: [1, 2, 3, 4], output: [5] };
          const testResult = net.test([misclass]);
          expect(testResult.error).toBeGreaterThanOrEqual(0.08);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              value: misclass,
              actual: runSpy.mock.results[0].value,
            },
          ]);
        });
      });
    });
    describe('using array,datum,object,number', () => {
      const trainingData = [
        {
          input: {
            monday: 0.1,
            tuesday: 0.2,
            wednesday: 0.3,
            thursday: 0.4,
          },
          output: { friday: 0.5 },
        },
      ];
      describe('inputSize of 1', () => {
        describe('no error', () => {
          it('can test w/ forecastNumbers of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [10],
              outputSize: 1,
            });
            net.train(trainingData, { iterations: 500 });
            const testResult = net.test(trainingData);
            expect(testResult.error).toBeLessThan(0.001);
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
            net.train(trainingData);
            const misclass = {
              input: {
                monday: 1,
                tuesday: 2,
                wednesday: 3,
                thursday: 4,
              },
              output: { friday: 5 },
            };
            const testResult = net.test([misclass]);
            expect(testResult.error).toBeGreaterThanOrEqual(0.08);
            expect(testResult.misclasses.length).toBe(1);
            expect(testResult.misclasses).toEqual([
              {
                value: misclass,
                actual: runSpy.mock.results[0].value,
              },
            ]);
          });
        });
      });
    });
    describe('using array,datum,array,array', () => {
      const trainingData1 = [
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
      const trainingData2 = [
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
      describe('no error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          net.train(trainingData1, { iterations: 500 });
          const testResult = net.test(trainingData1);
          expect(testResult.error).toBeLessThan(0.001);
          expect(testResult.misclasses.length).toBe(0);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          net.train(trainingData2, { iterations: 500 });
          const testResult = net.test(trainingData2);
          expect(testResult.error).toBeLessThan(0.001);
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
          net.train(trainingData1, { iterations: 500 });
          const misclass = {
            input: [
              [1, 5],
              [2, 4],
              [3, 3],
              [4, 2],
            ],
            output: [[5, 1]],
          };
          const testResult = net.test([misclass]);
          expect(testResult.error).toBeGreaterThan(0.1);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              value: misclass,
              actual: runSpy.mock.results[0].value,
            },
          ]);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          net.train(trainingData2, { iterations: 500 });
          const misclass = {
            input: [
              [1, 5],
              [2, 4],
              [3, 3],
            ],
            output: [
              [4, 2],
              [5, 1],
            ],
          };
          const testResult = net.test([misclass]);
          expect(testResult.error).toBeGreaterThanOrEqual(0.08);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              value: misclass,
              actual: runSpy.mock.results[0].value,
            },
          ]);
        });
      });
    });
    describe('using array,datum,array,object,number', () => {
      const trainingData1 = [
        {
          input: [
            { low: 0.1, high: 0.5 },
            { low: 0.2, high: 0.4 },
            { low: 0.3, high: 0.3 },
            { low: 0.4, high: 0.2 },
          ],
          output: [{ low: 0.5, high: 0.1 }],
        },
      ];
      const trainingData2 = [
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
      describe('no error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          net.train(trainingData1, { iterations: 500 });
          const testResult = net.test(trainingData1);
          expect(testResult.error).toBeLessThan(0.001);
          expect(testResult.misclasses.length).toBe(0);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          net.train(trainingData2, { iterations: 500 });
          const testResult = net.test(trainingData2);
          expect(testResult.error).toBeLessThan(0.001);
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
          net.train(trainingData1, { iterations: 500 });
          const misclass = {
            input: [
              { low: 1, high: 5 },
              { low: 2, high: 4 },
              { low: 3, high: 3 },
              { low: 4, high: 2 },
            ],
            output: [{ low: 0.5, high: 0.1 }],
          };
          const testResult = net.test([misclass]);
          expect(testResult.error).toBeGreaterThan(0.1);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              value: misclass,
              actual: runSpy.mock.results[0].value,
            },
          ]);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2,
          });
          net.train(trainingData2, { iterations: 500 });
          const misclass = {
            input: [
              { low: 1, high: 5 },
              { low: 2, high: 4 },
              { low: 3, high: 3 },
            ],
            output: [
              { low: 4, high: 2 },
              { low: 5, high: 1 },
            ],
          };
          const testResult = net.test([misclass]);
          expect(testResult.error).toBeGreaterThanOrEqual(0.08);
          expect(testResult.misclasses.length).toBe(1);
          expect(testResult.misclasses).toEqual([
            {
              value: misclass,
              actual: runSpy.mock.results[0].value,
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
    // it('array,object,number', () => {});
    // it('datum,array,object,number', () => {});
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
      expect(serializedNet.options.inputSize).toBe(inputSize);
      expect(serializedNet.options.hiddenLayers).toEqual(hiddenLayers);
      expect(serializedNet.options.outputSize).toBe(outputSize);
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
      let lastNetStatus: IRNNStatus = { error: Infinity, iterations: -1 };
      const trainingData = [
        { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 },
      ];
      net.train(trainingData, {
        callback: (status) => {
          lastNetStatus = status;
        },
        iterations: 50,
      });
      net.run({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 });
      const json = net.toJSON();
      const serializedNet = new RNNTimeStep();
      serializedNet.fromJSON(json);
      let lastSerializedNetStatus: IRNNStatus = {
        error: Infinity,
        iterations: -1,
      };
      serializedNet.train(trainingData, {
        iterations: 1,
        callback: (status: IRNNStatus) => {
          lastSerializedNetStatus = status;
        },
      });
      expect(lastSerializedNetStatus.error).toBeLessThan(lastNetStatus.error);
    });
  });
});
