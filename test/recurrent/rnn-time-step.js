import assert from 'assert';
import RNNTimeStep from '../../src/recurrent/rnn-time-step';
import LSTMTimeStep from '../../src/recurrent/lstm-time-step';
import Equation from '../../src/recurrent/matrix/equation';
import sinon from 'sinon';
import lookup from "../../src/lookup";

describe('RNNTimeStep', () => {
  describe('.createOutputMatrix()', () => {
    it('creates the outputConnector and output for model', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [9, 11],
        outputSize: 5,
      });
      assert.equal(net.model, null);
      net.model = {};
      net.createOutputMatrix();
      assert.equal(net.model.outputConnector.rows, 5);
      assert.equal(net.model.outputConnector.columns, 11);
      assert.equal(net.model.output.rows, 5);
      assert.equal(net.model.output.columns, 1);
    });
  });
  describe('.bindEquation()', () => {
    it('adds equations as expected', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [9, 11],
        outputSize: 5,
      });
      net.initialize();
      net.mapModel();
      assert.equal(net.model.equations.length, 0);
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.bindEquation();
      assert.equal(net.model.equations.length, 2);
      net.bindEquation();
      assert.equal(net.model.equations.length, 3);
    });
  });
  describe('.mapModel()', () => {
    describe('when .createHiddenLayers() does not provide model.hiddenLayers', () => {
      it('throws', () => {
        const net = new RNNTimeStep();
        net.createHiddenLayers = () => {};
        net.model = { hiddenLayers: [] };
        assert.throws(
          () => {
            net.mapModel();
          },
          'Error: net.hiddenLayers not set'
        );
      });
    });
    describe('when .createOutputMatrix() does not provide model.outputConnector', () => {
      it('throws', () => {
        const net = new RNNTimeStep();
        net.createOutputMatrix = () => {};
        net.model = {
          hiddenLayers: [],
          outputConnector: null,
          allMatrices: []
        };
        assert.throws(
          () => {
            net.mapModel();
          },
          'Error: net.model.outputConnector'
        );
      });
    });
    describe('when .createOutputMatrix() does not provide model.output', () => {
      it('throws', () => {
        const net = new RNNTimeStep();
        net.createOutputMatrix = () => {};
        net.model = {
          hiddenLayers: [],
          outputConnector: [],
          allMatrices: []
        };
        assert.throws(
          () => {
            net.mapModel();
          },
          'Error: net.model.output not set'
        );
      });
    });
    it('maps models to model.allMatrices', () => {
      const net = new RNNTimeStep();
      net.model = {
        allMatrices: [],
        hiddenLayers: []
      };
      net.mapModel();
      assert.equal(net.model.allMatrices.length, 5);
    });
  });
  describe('.backpropagate()', () => {
    it('steps through model.equations in reverse, calling model.equations[index].backpropagate', () => {
      const net = new RNNTimeStep();
      let i = 0;
      net.model = {
        equations: [
          { backpropagate: () => { assert.equal(i++, 2); } },
          { backpropagate: () => { assert.equal(i++, 1); } },
          { backpropagate: () => { assert.equal(i++, 0); } },
        ]
      };
      net.backpropagate();
      assert.equal(i, 3);
    });
  });
  describe('.run()', () => {
    describe('when this.inputSize = 1', () => {
      describe('when this.outputLookup is truthy', () => {
        it('uses this.runObject as fn, calls it, and sets this.run as it for next use', () => {
          const net = new RNNTimeStep({ inputSize: 1 });
          net.model = { equations: [null] };
          net.outputLookup = {};
          const stub = net.runObject = sinon.stub();
          net.run();
          assert(stub.called);
          assert.equal(net.run, stub);
        });
      });
      describe('when this.outputLookup is not truthy', () => {
        it('calls this.runNumbers and sets this.run as it for next use', () => {
          const net = new RNNTimeStep({ inputSize: 1 });
          net.model = {equations: [null]};
          const stub = net.runNumbers = sinon.stub();
          net.run();
          assert(stub.called);
          assert.equal(net.run, stub);
        });
      });
    });
    describe('when this.inputSize > 1', () => {
      it('calls this.runArrays and sets this.run as it for next use', () => {
        const net = new RNNTimeStep({ inputSize: 2 });
        net.model = {equations: [null]};
        const stub = net.runArrays = sinon.stub();
        net.run();
        assert(stub.called);
        assert.equal(net.run, stub);
      });
    });
  });
  describe('.train()', () => {
    it('throws on array,datum,array w/ inputSize of 2', () => {
      const data = [{input: [1, 2], output: [3, 4]}];
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 1
      });
      assert.throws(() => {
        net.train(data);
      }, 'inputSize must be 1 for this data size');
    });
    it('throws on array,datum,array w/ outputSize of 2', () => {
      const data = [{input: [1, 2], output: [3, 4]}];
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 2
      });
      assert.throws(() => {
        net.train(data);
      }, 'outputSize must be 1 for this data size');
    });
    it('throws on array,datum,object w/ inputSize of 2', () => {
      const data = [{ input: { a: 1, b: 2 }, output: { c: 3, d: 4 } }];
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2
      });
      assert.throws(() => {
        net.train(data);
      });
    });

    describe('automatically setting inputSize and outputSize', () => {
      describe('numbers', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            [.1,.2,.3,.4,.5]
          ];
          const options = {
            iterations: 0
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          assert.equal(net.inputSize, 1);
          assert.equal(net.outputSize, 1);
        });
      });
      describe('arrays', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            [[.1,.5],[.2,.4],[.3,.3],[.4,.2],[.5,.1]],
          ];
          const options = {
            iterations: 1
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          assert.equal(net.inputSize, 2);
          assert.equal(net.outputSize, 2);
        });
      });
      describe('object', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            { low: .1, med: .25, high: .5 }
          ];
          const options = {
            iterations: 1
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          assert.equal(net.inputSize, 1);
          assert.equal(net.outputSize, 1);
        });
      });
      describe('objects', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            [
              { low: .1, med: .25, high: .5 },
              { low: .5, med: .25, high: .1 }
            ]
          ];
          const options = {
            iterations: 1
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          assert.equal(net.inputSize, 3);
          assert.equal(net.outputSize, 3);
        });
      });
      describe('input/output numbers', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            { input: [.1, .2, .3, .4], output: [.5] }
          ];
          const options = {
            iterations: 1
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          assert.equal(net.inputSize, 1);
          assert.equal(net.outputSize, 1);
        });
      });
      describe('input/output arrays', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            {
              input: [
                [.1, .5]
              ],
              output: [
                [.5, .1]
              ],
            }
          ];
          const options = {
            iterations: 1
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          assert.equal(net.inputSize, 2);
          assert.equal(net.outputSize, 2);
        });
      });
      describe('input/output object', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            {
              input: {low: .1, high: .5},
              output: {low: .5, high: .1}
            }
          ];
          const options = {
            iterations: 1
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          assert.equal(net.inputSize, 1);
          assert.equal(net.outputSize, 1);
        });
      });
      describe('datum', () => {
        it('will set inputSize & outputSize if from data', () => {
          const data = [
            {
              input: [
                {low: .1, high: .5}
              ],
              output: [
                {low: .5, high: .1}
              ],
            }
          ];
          const options = {
            iterations: 1
          };
          const net = new RNNTimeStep();
          net.train(data, options);
          assert.equal(net.inputSize, 2);
          assert.equal(net.outputSize, 2);
        });
      });
      it('will not set inputSize & outputSize if already set larger than 1', () => {
        const net = new RNNTimeStep({ inputSize: 99, outputSize: 88 });
        net.initialize = () => {
          throw new Error('got passed size check');
        };
        assert.throws(() => {
          net.train([[0,1,2,3,4], [4,3,2,1,0]]);
        }, 'got passed size check');
        assert.equal(net.inputSize, 99);
        assert.equal(net.outputSize, 88);
      });
    });
    describe('calling using arrays', () => {
      describe('training data with 1D arrays', () => {
        beforeEach(() => {
          sinon.spy(LSTMTimeStep.prototype, 'trainArrays');
          sinon.spy(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainArrays.restore();
          Equation.prototype.predictTarget.restore();
        });
        it('uses .runInputNumbers with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [1],
            outputSize: 1
          });
          const trainingData = [
            [.1,.2,.3,.4,.5],
            [.5,.4,.3,.2,.1]
          ];
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainArrays.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainArrays.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainArrays.args[0][0], trainingData[0].map(value => Float32Array.from([value])));
          assert.deepEqual(LSTMTimeStep.prototype.trainArrays.args[1][0], trainingData[1].map(value => Float32Array.from([value])));
          assert.equal(Equation.prototype.predictTarget.callCount, 8);
          assert.equal(net.model.equations.length, 5);

          // first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], Float32Array.from([.1]));
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], Float32Array.from([.2]));

          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], Float32Array.from([.2]));
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], Float32Array.from([.3]));

          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], Float32Array.from([.3]));
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], Float32Array.from([.4]));

          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], Float32Array.from([.4]));
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], Float32Array.from([.5]));

          // second array
          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], Float32Array.from([.5]));
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], Float32Array.from([.4]));

          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], Float32Array.from([.4]));
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], Float32Array.from([.3]));

          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], Float32Array.from([.3]));
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], Float32Array.from([.2]));

          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], Float32Array.from([.2]));
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], Float32Array.from([.1]));
        });
        it('can learn basic logic', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1
          });
          const trainingData = [
            [.1,.2,.3,.4,.5],
            [.5,.4,.3,.2,.1]
          ];
          const result = net.train(trainingData, { errorThresh: 0.05 });
          assert(result.error < 0.05, `error ${ result.error } did not go below 0.05`);
          assert(result.iterations < 1000, `iterations ${ result.iterations } went above 1000`);
        });
      });

      describe('training data with 2D arrays', () => {
        beforeEach(() => {
          sinon.spy(LSTMTimeStep.prototype, 'trainArrays');
          sinon.spy(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainArrays.restore();
          Equation.prototype.predictTarget.restore();
        });
        it('uses .trainArrays with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [1],
            outputSize: 2
          });
          const trainingData = [
            [.1,.5],
            [.2,.4],
            [.3,.3],
            [.4,.2],
            [.5,.1],
          ];
          const trainingDataFormatted = trainingData.map(array => Float32Array.from(array));
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainArrays.callCount, 1);
          assert.equal(LSTMTimeStep.prototype.trainArrays.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainArrays.args[0][0], trainingDataFormatted);
          assert.equal(Equation.prototype.predictTarget.callCount, 4);
          assert.equal(net.model.equations.length, 5);

          // first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], Float32Array.from([.1,.5]));
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], Float32Array.from([.2,.4]));

          // second array
          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], Float32Array.from([.2,.4]));
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], Float32Array.from([.3,.3]));

          // third array
          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], Float32Array.from([.3,.3]));
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], Float32Array.from([.4,.2]));

          // forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], Float32Array.from([.4,.2]));
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], Float32Array.from([.5,.1]));
        });

        it('can learn basic logic', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [20],
            outputSize: 2
          });
          const trainingData = [
            [.1,.5],
            [.2,.4],
            [.3,.3],
            [.4,.2],
            [.5,.1],
          ];
          const result = net.train(trainingData, { errorThresh: 0.05 });
          assert(result.error < 0.05, `error ${ result.error } did not go below 0.05`);
          assert(result.iterations < 4000, `iterations ${ result.iterations } went above 4000`);
        });
      });

      describe('training data with 3D arrays', () => {
        beforeEach(() => {
          sinon.spy(LSTMTimeStep.prototype, 'trainArrays');
          sinon.spy(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainArrays.restore();
          Equation.prototype.predictTarget.restore();
        });
        it('uses .trainArrays with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [1],
            outputSize: 2
          });
          const trainingData = [
            [
              [.1,.5],
              [.2,.4],
              [.3,.3],
              [.4,.2],
              [.5,.1],
            ],
            [
              [.5,.9],
              [.6,.8],
              [.7,.7],
              [.8,.6],
              [.9,.5],
            ],
          ];
          const trainingDataFormatted0 = trainingData[0].map(array => Float32Array.from(array));
          const trainingDataFormatted1 = trainingData[1].map(array => Float32Array.from(array));

          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainArrays.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainArrays.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainArrays.args[0][0], trainingDataFormatted0);
          assert.deepEqual(LSTMTimeStep.prototype.trainArrays.args[1][0], trainingDataFormatted1);
          assert.equal(Equation.prototype.predictTarget.callCount, 8);
          assert.equal(net.model.equations.length, 5);

          // first set, first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], Float32Array.from([.1,.5]));
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], Float32Array.from([.2,.4]));

          // first set, second array
          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], Float32Array.from([.2,.4]));
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], Float32Array.from([.3,.3]));

          // first set, third array
          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], Float32Array.from([.3,.3]));
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], Float32Array.from([.4,.2]));

          // first set, forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], Float32Array.from([.4,.2]));
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], Float32Array.from([.5,.1]));

          // second set, first array
          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], Float32Array.from([.5,.9]));
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], Float32Array.from([.6,.8]));

          // second set, second array
          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], Float32Array.from([.6,.8]));
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], Float32Array.from([.7,.7]));

          // second set, third array
          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], Float32Array.from([.7,.7]));
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], Float32Array.from([.8,.6]));

          // second set, forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], Float32Array.from([.8,.6]));
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], Float32Array.from([.9,.5]));
        });

        it('can learn basic logic', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [30],
            outputSize: 2
          });
          const trainingData = [
            [
              [.1,.5],
              [.2,.4],
              [.3,.3],
              [.4,.2],
              [.5,.1],
            ],
            [
              [.5,.9],
              [.6,.8],
              [.7,.7],
              [.8,.6],
              [.9,.5],
            ],
          ];
          const result = net.train(trainingData, { errorThresh: 0.05 });
          assert(result.error < 0.05, `error ${ result.error } did not go below 0.05`);
          assert(result.iterations < 4000, `iterations ${ result.iterations } went above 4000`);
        });
      });
    });

    describe('calling using training datum', () => {
      describe('training data with objects', () => {
        beforeEach(() => {
          sinon.spy(LSTMTimeStep.prototype, 'trainInputOutput');
          sinon.spy(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainInputOutput.restore();
          Equation.prototype.predictTarget.restore();
        });
        it('uses .runInputOutput with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [1],
            outputSize: 1
          });
          // average temp
          const trainingData = [
            // Washington DC
            {
              input: {
                jan: 42,
                feb: 44,
                mar: 53,
                apr: 64
              },
              output: {
                may: 75,
                jun: 83
              }
            },

            // Bluff Utah
            {
              input: {
                jan: 44,
                feb: 52,
                mar: 63,
                apr: 72
              },
              output: {
                may: 82,
                jun: 92
              }
            },
          ];
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainInputOutput.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainInputOutput.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutput.args[0][0], { input: [42, 44, 53, 64].map(value => Float32Array.from([value])), output: [75, 83].map(value => Float32Array.from([value])) });
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutput.args[1][0], { input: [44, 52, 63, 72].map(value => Float32Array.from([value])), output: [82, 92].map(value => Float32Array.from([value])) });
          assert.equal(Equation.prototype.predictTarget.callCount, 10);
          assert.equal(net.model.equations.length, 6);

          // first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], [42]);
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], [44]);

          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], [44]);
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], [53]);

          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], [53]);
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], [64]);

          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], [64]);
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], [75]);

          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], [75]);
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], [83]);

          // second array
          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], [44]);
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], [52]);

          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], [52]);
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], [63]);

          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], [63]);
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], [72]);

          assert.deepEqual(Equation.prototype.predictTarget.args[8][0], [72]);
          assert.deepEqual(Equation.prototype.predictTarget.args[8][1], [82]);

          assert.deepEqual(Equation.prototype.predictTarget.args[9][0], [82]);
          assert.deepEqual(Equation.prototype.predictTarget.args[9][1], [92]);
        });
      });
      describe('training data with 1D arrays', () => {
        beforeEach(() => {
          sinon.spy(LSTMTimeStep.prototype, 'trainInputOutput');
          sinon.spy(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainInputOutput.restore();
          Equation.prototype.predictTarget.restore();
        });
        it('uses .runInputOutput with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [1],
            outputSize: 1
          });
          const trainingData = [
            { input: [1,2,3,4], output: [5] },
            { input: [5,4,3,2], output: [1] },
          ];
          const trainingDataFormatted0 = {
            input: trainingData[0].input.map(value => Float32Array.from([value])),
            output: trainingData[0].output.map(value => Float32Array.from([value])),
          };
          const trainingDataFormatted1 = {
            input: trainingData[1].input.map(value => Float32Array.from([value])),
            output: trainingData[1].output.map(value => Float32Array.from([value])),
          };
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainInputOutput.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainInputOutput.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutput.args[0][0], trainingDataFormatted0);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutput.args[1][0], trainingDataFormatted1);
          assert.equal(Equation.prototype.predictTarget.callCount, 8);
          assert.equal(net.model.equations.length, 5);

          // first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], Float32Array.from([1]));
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], Float32Array.from([2]));

          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], Float32Array.from([2]));
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], Float32Array.from([3]));

          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], Float32Array.from([3]));
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], Float32Array.from([4]));

          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], Float32Array.from([4]));
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], Float32Array.from([5]));

          // second array
          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], Float32Array.from([5]));
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], Float32Array.from([4]));

          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], Float32Array.from([4]));
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], Float32Array.from([3]));

          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], Float32Array.from([3]));
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], Float32Array.from([2]));

          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], Float32Array.from([2]));
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], Float32Array.from([1]));
        });
      });

      describe('training data with 2D arrays', () => {
        beforeEach(() => {
          sinon.spy(LSTMTimeStep.prototype, 'trainInputOutput');
          sinon.spy(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainInputOutput.restore();
          Equation.prototype.predictTarget.restore();
        });
        it('uses .runInputOutputArray with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [1],
            outputSize: 2
          });
          const trainingData = [
            {
              input: [
                [.1,.5],
                [.2,.4],
                [.3,.3],
                [.4,.2],
              ],
              output: [[.5,.1]]
            },
            {
              input: [
                [.5,.9],
                [.6,.8],
                [.7,.7],
                [.8,.6],
              ],
              output: [[.9,.5]]
            }
          ];
          const trainingDataFormatted0 = {
            input: trainingData[0].input.map(value => Float32Array.from(value)),
            output: trainingData[0].output.map(value => Float32Array.from(value)),
          };
          const trainingDataFormatted1 = {
            input: trainingData[1].input.map(value => Float32Array.from(value)),
            output: trainingData[1].output.map(value => Float32Array.from(value)),
          };
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainInputOutput.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainInputOutput.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutput.args[0][0], trainingDataFormatted0);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutput.args[1][0], trainingDataFormatted1);
          assert.equal(Equation.prototype.predictTarget.callCount, 8);
          assert.equal(net.model.equations.length, 5);

          // first set, first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], Float32Array.from([.1,.5]));
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], Float32Array.from([.2,.4]));

          // first set, second array
          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], Float32Array.from([.2,.4]));
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], Float32Array.from([.3,.3]));

          // first set, third array
          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], Float32Array.from([.3,.3]));
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], Float32Array.from([.4,.2]));

          // first set, forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], Float32Array.from([.4,.2]));
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], Float32Array.from([.5,.1]));

          // second set, first array
          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], Float32Array.from([.5,.9]));
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], Float32Array.from([.6,.8]));

          // second set, second array
          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], Float32Array.from([.6,.8]));
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], Float32Array.from([.7,.7]));

          // second set, third array
          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], Float32Array.from([.7,.7]));
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], Float32Array.from([.8,.6]));

          // second set, forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], Float32Array.from([.8,.6]));
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], Float32Array.from([.9,.5]));
        });
      });
    });

    describe('prediction using arrays', () => {
      it('can train and predict linear numeric, single input, 1 to 5, and 5 to 1', () => {
        const net = new LSTMTimeStep({
          inputSize: 1,
          hiddenLayers: [20, 20],
          outputSize: 1
        });

        const trainingData = [
          [.1,.2,.3,.4,.5],
          [.5,.4,.3,.2,.1],
        ];

        const result = net.train(trainingData);
        assert(result.error < 0.05, `error ${ result.error } is not below 0.05`);
        const closeToFive = net.run([.1,.2,.3,.4]);
        const closeToOne = net.run([.5,.4,.3,.2]);
        assert(closeToOne.toFixed(1) === '0.1', `${ closeToOne } is not close to 0.1`);
        assert(closeToFive.toFixed(1) === '0.5', `${ closeToFive } is not close to 0.5`);
      });
      it('can train and predict single linear array, two input, 1 to 5, and 5 to 1', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [20],
          outputSize: 2
        });

        //Same test as previous, but combined on a single set
        const trainingData = [
          [.1,.5],
          [.2,.4],
          [.3,.3],
          [.4,.2],
          [.5,.1]
        ];

        const result = net.train(trainingData, { errorThresh: 0.01 });
        assert(result.error < 0.01, `error ${ result.error } did not go below 0.01`);
        const closeToFiveAndOne = net.run([[.1,.5],[.2,.4],[.3,.3],[.4,.2]]);
        assert(closeToFiveAndOne[0].toFixed(1) === '0.5', `${ closeToFiveAndOne[0] } is not close to 0.5`);
        assert(closeToFiveAndOne[1].toFixed(1) === '0.1', `${ closeToFiveAndOne[1] } is not close to 0.1`);
      });
      it('can train and predict multiple linear array, two input, 1 to 5, 5 to 1, 5 to 9, and 9 to 5', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [40],
          outputSize: 2
        });

        //Same test as previous, but combined on a single set
        const trainingData = [
          [
            [.1,.5],
            [.2,.4],
            [.3,.3],
            [.4,.2],
            [.5,.1]
          ],
          [
            [.5,.9],
            [.6,.8],
            [.7,.7],
            [.8,.6],
            [.9,.5]
          ],
        ];

        const result = net.train(trainingData);
        assert(result.error < 0.05, `error ${ result.error } did not go below 0.05`);
        const closeToFiveAndOne = net.run([[.1,.5],[.2,.4],[.3,.3],[.4,.2]]);
        assert(closeToFiveAndOne[0].toFixed(1) === '0.5', `${ closeToFiveAndOne[0] } is not close to 0.5`);
        assert(closeToFiveAndOne[1].toFixed(1) === '0.1', `${ closeToFiveAndOne[1] } is not close to 0.1`);
        const closeToNineAndFive = net.run([[.5,.9],[.6,.8],[.7,.7],[.8,.6]]);
        assert(closeToNineAndFive[0].toFixed(1) === '0.9', `${ closeToNineAndFive[0] } is not close to 0.9`);
        assert(closeToNineAndFive[1].toFixed(1) === '0.5', `${ closeToNineAndFive[1] } is not close to 0.5`);
      });
    });

    describe('prediction using input/output', () => {
      describe('with objects', () => {
        it('can train and predict input/output linear array avg weather data', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [5],
            outputSize: 1
          });

          // average temp
          const trainingData = [
            // Washington DC
            {
              input: {
                jan: .42,
                feb: .44,
                mar: .53,
                apr: .64
              },
              output: {
                may: .75,
                jun: .83
              }
            },

            // Bluff Utah
            {
              input: {
                jan: .44,
                feb: .52,
                mar: .63,
                apr: .72
              },
              output: {
                may: .82,
                jun: .92
              }
            },
          ];

          const result = net.train(trainingData);
          assert(result.error < 0.05, `error ${ result.error } is not below 0.05`);
          const washington = net.run({ jan: .42, feb: .44, mar: .53, apr: .64 });
          const bluff = net.run({ jan: .44, feb: .52, mar: .63, apr: .72 });
          assert(washington.may.toFixed(2).indexOf('0.7') > -1, `${ washington.may } is not close to .7`);
          assert(washington.jun.toFixed(2).indexOf('0.8') > -1, `${ washington.jun } is not close to .8`);

          assert(bluff.may.toFixed(2).indexOf('0.8') > -1, `${ bluff.may } is not close to .8`);
          assert(bluff.jun.toFixed(2).indexOf('0.9') > -1, `${ bluff.jun } is not close to .9`);
        });
      });

      describe('with arrays', () => {
        it('can use inputs(4) and output(1)', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [20, 20],
            outputSize: 1
          });

          //Same test as previous, but combined on a single set
          const trainingData = [
            {
              input: [.1,.2,.3,.4],
              output: [.5]
            },
            {
              input: [.5,.4,.3,.2],
              output: [.1]
            }
          ];

          const result = net.train(trainingData);
          assert(result.error < 0.09, `error ${ result.error } did not go below 0.09`);
          const closeToFive = net.run([.1,.2,.3,.4]);
          const closeToOne = net.run([.5,.4,.3,.2]);
          assert(closeToFive.toFixed(1) === '0.5', `${ closeToFive } is not close to 0.5`);
          assert(closeToOne.toFixed(1) === '0.1', `${ closeToOne } is not close to 0.1`);
        });
        it('can train and predict using array of input and output, two input, 1 to 5, and 5 to 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [20],
            outputSize: 2
          });

          //Same test as previous, but combined on a single set
          const trainingData = [
            {
              input: [[.1,.5],[.2,.4],[.3,.3],[.4,.2]],
              output: [[.5,.1]]
            }
          ];

          const result = net.train(trainingData, { errorThresh: 0.01 });
          assert(result.error < 0.01, `error ${ result.error } did not go below 0.01`);
          const closeToFiveAndOne = net.run([[.1,.5],[.2,.4],[.3,.3],[.4,.2]]);
          assert(closeToFiveAndOne[0].toFixed(1) === '0.5', `${ closeToFiveAndOne[0] } is not close to 0.5`);
          assert(closeToFiveAndOne[1].toFixed(1) === '0.1', `${ closeToFiveAndOne[1] } is not close to 0.1`);
        });
      });
    });
  });
  describe('.trainNumbers()', () => {
    function prepNet(net) {
      // put some weights into recurrent inputs
      net.initialLayerInputs.forEach(matrix => matrix.weights = matrix.weights.map(() => 1));
      net.model.equationConnections.forEach(matrix => matrix[0].weights = matrix[0].weights.map(() => 1));

      // make any values that are less than zero, positive, so relu doesn't go into zero
      net.model.equations.forEach(equation => equation.states.forEach((state => {
        if (state.left) state.left.weights = state.left.weights.map(value => value < 0 ? Math.abs(value) : value);
        if (state.right) state.right.weights = state.right.weights.map(value => value < 0 ? Math.abs(value) : value);
      })));
    }
    it('forward propagates weights', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
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
          state.product.weights.forEach((weight, weightIndex) => {
            assert.equal(weight, 0);
          });
        });
      });

      prepNet(net);

      net.trainNumbers([1, 2, 3]);

      net.model.equations.forEach((equation, equationIndex) => {
        // we back propagate zero, so don't check last equation, as it has zeros
        if (equationIndex > 1) return;
        equation.states.forEach((state, stateIndex) => {
          for (let weightIndex = 0; weightIndex < state.product.weights.length; weightIndex++) {
            const weight = state.product.weights[weightIndex];
            assert.notEqual(weight, 0, `equation is 0 on equation ${ equationIndex}, state ${ stateIndex }, weight ${ weightIndex }`);
          }
        });
      });
    });
    it('back propagates deltas', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
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
            assert.equal(weight, 0);
          });
        });
      });

      prepNet(net);

      net.model.equations.forEach((equation, equationIndex) => {
        // we back propagate zero, so don't check last equation, as it has zeros
        if (equationIndex > 1) return;
        equation.states.forEach((state, stateIndex) => {
          state.product.deltas.forEach((delta, weightIndex) => {
            assert.equal(delta, 0, `equation is not 0 on equation ${ equationIndex}, state ${ stateIndex }, delta ${ weightIndex }`);
          });
        });
      });

      net.trainNumbers([[1], [2], [3]]);
      net.backpropagate();

      net.model.equations.forEach((equation, equationIndex) => {
        // we back propagate zero, so don't check last equation, as it has zeros
        if (equationIndex > 1) return;
        equation.states.forEach((state, stateIndex) => {
          state.product.deltas.forEach((delta, weightIndex) => {
            assert.notEqual(delta, 0, `equation is 0 on equation ${ equationIndex}, state ${ stateIndex }, delta ${ weightIndex }`);
          });
        });
      });
    });
    it('creates the correct size equations', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [20],
        outputSize: 1
      });

      net.initialize();
      net.bindEquation();
      net.trainNumbers([1, 2, 0]);
      assert.equal(net.model.equations.length, 3);
    });
    it('copies weights to deltas on end of equation', (done) => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [20],
        outputSize: 1
      });

      net.initialize();
      net.bindEquation();
      net.bindEquation();
      assert.equal(net.model.equations.length, 2);
      const equationOutput0 = net.model.equations[0].states[net.model.equations[0].states.length - 1];
      const equationOutput1 = net.model.equations[1].states[net.model.equations[1].states.length - 1];
      const originalDeltas0 = equationOutput0.product.deltas.slice(0);
      const originalDeltas1 = equationOutput1.product.deltas.slice(0);
      net.trainNumbers([1, 2, 1]);
      assert.equal(net.model.equations.length, 3);
      assert.notDeepEqual(originalDeltas0, equationOutput0.product.deltas);
      assert.notDeepEqual(originalDeltas1, equationOutput1.product.deltas);
      assert.notDeepEqual(equationOutput0.product.deltas, equationOutput1.product.deltas);
      done();
    });
  });
  describe('.runNumbers()', () => {
    it('returns null when this.isRunnable returns false', () => {
      const result = RNNTimeStep.prototype.runNumbers.apply({
        isRunnable: false
      });
      assert.equal(result, null);
    });
    it('sets up equations for length of input plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.runNumbers([1,2,3]);
      assert.equal(net.model.equations.length, 4);
    });
    it('sets calls equation.runInput() with value in array for each input plus 1 for 0 (to end) output', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      const runInputStubs = [];
      net.bindEquation = function() {
        const stub = sinon.stub().returns({ weights: [] });
        runInputStubs.push(stub);
        this.model.equations.push({ runInput: stub });
      };
      net.bindEquation();
      net.runNumbers([1,2,3]);
      assert.equal(runInputStubs.length, 4);
      assert(runInputStubs[0].called);
      assert(runInputStubs[1].called);
      assert(runInputStubs[2].called);
      assert(runInputStubs[3].called);

      assert.deepEqual(runInputStubs[0].args[0][0], [1]);
      assert.deepEqual(runInputStubs[1].args[0][0], [2]);
      assert.deepEqual(runInputStubs[2].args[0][0], [3]);
      assert.deepEqual(runInputStubs[3].args[0][0], [0]);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      const stub = net.end = sinon.stub();
      net.initialize();
      net.bindEquation();
      net.runNumbers([1,2,3]);
      assert(stub.called);
    });
  });
  describe('.forecastNumbers()', () => {
    it('returns null when this.isRunnable returns false', () => {
      const result = RNNTimeStep.prototype.forecastNumbers.apply({
        isRunnable: false
      });
      assert.equal(result, null);
    });
    it('sets up equations for length of input plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.forecastNumbers([1,2,3], 2);
      assert.equal(net.model.equations.length, 6);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      const stub = net.end = sinon.stub();
      net.initialize();
      net.bindEquation();
      net.forecastNumbers([1,2,3], 2);
      assert(stub.called);
    });
    it('outputs the length of required forecast', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      net.bindEquation();
      const result = net.forecastNumbers([1,2,3], 2);
      assert.equal(result.length, 2);
    });
    it('outputs a flat array of numbers', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      net.bindEquation();
      const result = net.forecastNumbers([1,2,3], 2);
      assert.equal(typeof result[0], 'number');
      assert.equal(typeof result[1], 'number');
    });
  });
  describe('.runObject()', () => {
    it('calls this.forecastNumbers()', () => {
      const forecastNumbersStub = sinon.stub().returns([99, 88]);
      const result = RNNTimeStep.prototype.runObject.apply({
        inputLookup: {
          input1: 0,
          input2: 1
        },
        outputLookup: {
          output1: 0,
          output2: 1
        },
        forecastNumbers: forecastNumbersStub,
      }, [1, 2]);

      assert.deepEqual(result, {
        output1: 99,
        output2: 88
      });
      assert(forecastNumbersStub.called);
    });
    it('handles object to object with lookup tables being same w/ inputSize of 1', () => {
      const inputSize = 1;
      const hiddenLayers = [10];
      const outputSize = 1;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize
      });
      let lastStatus;
      net.train([{ monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 }], {
        log: (status) => {
          lastStatus = status;
        }
      });
      const result = net.run({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 });
      assert.equal(Object.keys(result).length, 1);
      assert.equal(result.friday.toFixed(0), '5');
    });
  });
  describe('.forecastObjects()', () => {
    it('maps values correctly', () => {
      const forecastArrays = (input, count) => {
        assert(count === 2);
        return [
          [.8,.7],
          [.6,.5]
        ];
      };
      const instance = {
        inputLookup: { low: 0, high: 1 },
        inputLookupLength: 2,
        outputLookup: { low: 0, high: 1 },
        outputLookupLength: 2,
        forecastArrays
      };
      const input = [
        { low: 0.1, high: 0.9 },
        { low: 0.1, high: 0.9 },
        { low: 0.1, high: 0.9 },
      ];
      const result = RNNTimeStep.prototype.forecastObjects.apply(instance, [input, 2]);
      assert.deepEqual(result, [
        { low: .8, high: .7 },
        { low: .6, high: .5 },
      ]);
    });
  });
  describe('.trainInputOutput()', () => {
    it('sets up equations for length of input(3), output(1) plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.trainInputOutput({ input: [1,2,3], output: [4] });
      assert.equal(net.model.equations.length, 4);
    });
    it('sets up equations for length of input(3), output(2) plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.trainInputOutput({ input: [1,2,3], output: [4,5] });
      assert.equal(net.model.equations.length, 5);
    });
    it('calls equation.predictTarget for each input', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      const predictTargetStubs = [];
      const runInputStubs = [];
      net.bindEquation = function() {
        const predictTargetStub = sinon.stub();
        const runInputStub = sinon.stub();
        predictTargetStubs.push(predictTargetStub);
        runInputStubs.push(runInputStub);
        this.model.equations.push({
          predictTarget: predictTargetStub,
          runInput: runInputStub
        });
      };
      assert.equal(net.model.equations.length, 0);
      const data = net.formatData([{ input: [1,2,3], output: [4,5] }]);
      net.trainInputOutput(data[0]);
      assert.equal(net.model.equations.length, 5);

      assert(!runInputStubs[0].called);
      assert(!runInputStubs[1].called);
      assert(!runInputStubs[2].called);
      assert(!runInputStubs[3].called);

      assert(predictTargetStubs[0].called);
      assert(predictTargetStubs[1].called);
      assert(predictTargetStubs[2].called);
      assert(predictTargetStubs[3].called);
      assert(runInputStubs[4].called);

      assert.deepEqual(predictTargetStubs[0].args[0], [[1], [2]]);
      assert.deepEqual(predictTargetStubs[1].args[0], [[2], [3]]);
      assert.deepEqual(predictTargetStubs[2].args[0], [[3], [4]]);
      assert.deepEqual(predictTargetStubs[3].args[0], [[4], [5]]);
      assert.deepEqual(runInputStubs[4].args[0], [[0]]);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      const stub = net.end = sinon.stub();
      net.initialize();
      net.bindEquation();
      net.trainInputOutput({ input: [1,2,3], output: [4,5] });
      assert(stub.called);
    });
  });
  describe('.trainArrays()', () => {
    it('sets up equations for length of input(3), output(1) plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2
      });
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.trainArrays([[1,4],[2,3],[3,2],[4,1]]);
      assert.equal(net.model.equations.length, 4);
    });
    it('sets up equations for length of input(3), output(2) plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2
      });
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.trainArrays([[1,5],[2,4],[3,3],[4,2], [5,1]]);
      assert.equal(net.model.equations.length, 5);
    });
    it('calls equation.predictTarget for each input', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      const predictTargetStubs = [];
      const runInputStubs = [];
      net.bindEquation = function() {
        const predictTargetStub = sinon.stub();
        const runInputStub = sinon.stub();
        predictTargetStubs.push(predictTargetStub);
        runInputStubs.push(runInputStub);
        this.model.equations.push({
          predictTarget: predictTargetStub,
          runInput: runInputStub
        });
      };
      assert.equal(net.model.equations.length, 0);
      net.trainArrays([[1,5],[2,4],[3,3],[4,2],[5,1]]);
      assert.equal(net.model.equations.length, 5);

      assert(!runInputStubs[0].called);
      assert(!runInputStubs[1].called);
      assert(!runInputStubs[2].called);
      assert(!runInputStubs[3].called);

      assert(predictTargetStubs[0].called);
      assert(predictTargetStubs[1].called);
      assert(predictTargetStubs[2].called);
      assert(predictTargetStubs[3].called);
      assert(runInputStubs[4].called);

      assert.deepEqual(predictTargetStubs[0].args[0], [[1, 5], [2, 4]]);
      assert.deepEqual(predictTargetStubs[1].args[0], [[2, 4], [3, 3]]);
      assert.deepEqual(predictTargetStubs[2].args[0], [[3, 3], [4, 2]]);
      assert.deepEqual(predictTargetStubs[3].args[0], [[4, 2], [5, 1]]);
      assert.deepEqual(runInputStubs[4].args[0], [[0]]);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2
      });
      const stub = net.end = sinon.stub();
      net.initialize();
      net.bindEquation();
      net.trainArrays([[1,5],[2,4],[3,3],[4,2],[5,1]]);
      assert(stub.called);
    });
  });
  describe('.runArrays()', () => {
    it('returns null when this.isRunnable returns false', () => {
      const result = RNNTimeStep.prototype.runArrays.apply({
        isRunnable: false
      });
      assert.equal(result, null);
    });
    it('sets up equations for length of input plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2
      });
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.runArrays([[1,3],[2,2],[3,1]]);
      assert.equal(net.model.equations.length, 4);
    });
    it('sets calls equation.runInput() with value in array for each input plus 1 for 0 (to end) output', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2
      });
      net.initialize();
      const runInputStubs = [];
      net.bindEquation = function() {
        const stub = sinon.stub().returns({ weights: [] });
        runInputStubs.push(stub);
        this.model.equations.push({ runInput: stub });
      };
      net.bindEquation();
      net.runArrays([[1,3],[2,2],[3,1]]);
      assert.equal(runInputStubs.length, 4);
      assert(runInputStubs[0].called);
      assert(runInputStubs[1].called);
      assert(runInputStubs[2].called);
      assert(runInputStubs[3].called);

      assert.deepEqual(runInputStubs[0].args[0][0], [1,3]);
      assert.deepEqual(runInputStubs[1].args[0][0], [2,2]);
      assert.deepEqual(runInputStubs[2].args[0][0], [3,1]);
      assert.deepEqual(runInputStubs[3].args[0][0], [0,0]);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2
      });
      const stub = net.end = sinon.stub();
      net.initialize();
      net.bindEquation();
      net.runArrays([[1,3],[2,2],[3,1]]);
      assert(stub.called);
    });
  });
  describe('.forecastArrays()', () => {
    it('returns null when this.isRunnable returns false', () => {
      const result = RNNTimeStep.prototype.forecastArrays.apply({
        isRunnable: false
      });
      assert.equal(result, null);
    });
    it('sets up equations for length of input plus count plus 1 for internal of 0', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: 2
      });
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.equations.length, 1);
      net.forecastArrays([[1,3],[2,2],[3,1]], 2);
      assert.equal(net.model.equations.length, 6);
    });
    it('sets calls this.end() after calls equations.runInput', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      const stub = net.end = sinon.stub();
      net.initialize();
      net.bindEquation();
      net.forecastArrays([[1,3],[2,2],[3,1]], 2);
      assert(stub.called);
    });
    it('outputs the length of required forecast', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });
      net.initialize();
      net.bindEquation();
      const result = net.forecastArrays([[1,3],[2,2],[3,1]], 2);
      assert.equal(result.length, 2);
    });
    it('outputs a nested array of numbers', () => {
      const outputWidth = 4;
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [2],
        outputSize: outputWidth
      });
      net.initialize();
      net.bindEquation();
      const predictionsCount = 3;
      const result = net.forecastArrays([[1,3],[2,2],[3,1]], predictionsCount);
      assert.equal(result.length, predictionsCount);
      assert.equal(result[0].length, outputWidth);
      assert.equal(result[1].length, outputWidth);
      assert.equal(result[2].length, outputWidth);
      assert.equal(typeof result[0][0], 'number');
      assert.equal(typeof result[0][1], 'number');
      assert.equal(typeof result[0][2], 'number');
      assert.equal(typeof result[0][3], 'number');
      assert.equal(typeof result[1][0], 'number');
      assert.equal(typeof result[1][1], 'number');
      assert.equal(typeof result[1][2], 'number');
      assert.equal(typeof result[1][3], 'number');
      assert.equal(typeof result[2][0], 'number');
      assert.equal(typeof result[2][1], 'number');
      assert.equal(typeof result[2][2], 'number');
      assert.equal(typeof result[2][3], 'number');
    });
  });
  describe('.forecast()', () => {
    describe('when this.inputSize = 1', () => {
      it('calls this.forecastNumbers and sets this.forecast as it for next use', () => {
        const net = new RNNTimeStep({ inputSize: 1 });
        net.model = {equations: [null]};
        const stub = net.forecastNumbers = sinon.stub();
        net.forecast();
        assert(stub.called);
        assert.equal(net.forecast, stub);
      });
    });
    describe('when this.inputSize > 1', () => {
      it('calls this.forecastArrays and sets this.forecast as it for next use', () => {
        const net = new RNNTimeStep({ inputSize: 2 });
        net.model = {equations: [null]};
        const stub = net.forecastArrays = sinon.stub();
        net.forecast();
        assert(stub.called);
        assert(net.forecast === stub);
      });
    });
    describe('using numbers', () => {
      it('can use an input of numbers of length 3 and give an output of length 2', () => {
        const net = new LSTMTimeStep({
          inputSize: 1,
          hiddenLayers: [10],
          outputSize: 1
        });

        //Same test as previous, but combined on a single set
        const trainingData = [
          {
            input: [.1,.2,.3],
            output: [.4,.5]
          },
          {
            input: [.5,.4,.3],
            output: [.2,.1]
          }
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.01 });
        assert(trainResult.error < 0.01, `error ${ trainResult.error } did not go below 0.01`);
        const result1 = net.forecast([.1,.2,.3], 2);
        assert.equal(result1.length, 2);
        assert(result1[0].toFixed(1) === '0.4', `${ result1[0] } is not close to 0.4`);
        assert(result1[1].toFixed(1) === '0.5', `${ result1[1] } is not close to 0.5`);

        const result2 = net.forecast([.5,.4,.3], 2);
        assert.equal(result2.length, 2);
        assert(result2[0].toFixed(1) === '0.2', `${ result2[0] } is not close to 0.2`);
        assert(result2[1].toFixed(1) === '0.1', `${ result2[1] } is not close to 0.1`);
      });
    });
    describe('using arrays', () => {
      it('can use an input array of length 3 and give an output of length 2', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [20],
          outputSize: 2
        });

        //Same test as previous, but combined on a single set
        const trainingData = [
          {
            input: [[.1,.5],[.2,.4],[.3,.3]],
            output: [[.4,.2],[.5,.1]]
          }
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.01 });
        assert(trainResult.error < 0.01, `error ${ trainResult.error } did not go below 0.01`);
        const result = net.forecast([[.1,.5],[.2,.4],[.3,.3]], 2);
        assert.equal(result.length, 2);
        assert(result[0][0].toFixed(1) === '0.4', `${ result[0][0] } is not close to 0.4`);
        assert(result[0][1].toFixed(1) === '0.2', `${ result[0][1] } is not close to 0.2`);
        assert(result[1][0].toFixed(1) === '0.5', `${ result[0][0] } is not close to 0.5`);
        assert(result[1][1].toFixed(1) === '0.1', `${ result[0][1] } is not close to 0.1`);
      });
    });
    describe('using object', () => {
      it('can use an input object of 3 keys and give an output of 2 keys', () => {
        const net = new LSTMTimeStep({
          inputSize: 1,
          hiddenLayers: [20],
          outputSize: 1
        });

        const trainingData = [
          {
            input: { monday: .1, tuesday: .2, wednesday: .3, thursday: .3 },
            output: { friday: .4, saturday: .5 }
          }
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.01 });
        assert(trainResult.error < 0.01, `error ${ trainResult.error } did not go below 0.01`);
        const result = net.forecast({ monday: .1, tuesday: .2, wednesday: .3, thursday: .3 }, 2);
        assert.equal(Object.keys(result).length, 2);
        assert(result.friday.toFixed(1) === '0.4', `${ result.friday } is not close to 0.4`);
        assert(result.saturday.toFixed(1) === '0.5', `${ result.saturday } is not close to 0.5`);
      });
    });
    describe('using objects', () => {
      it('can use an input array of length 3 and give an output of length 2', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [20],
          outputSize: 2
        });

        //Same test as previous, but combined on a single set
        const trainingData = [
          {
            input: [{ low: .1, high: .5 }, { low:.2, high: .4}, { low: .3, high: .3 }],
            output: [{ low: .4, high: .2 }, { low: .5, high: .1 }]
          }
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.01 });
        assert(trainResult.error < 0.01, `error ${ trainResult.error } did not go below 0.01`);
        const result = net.forecast([{ low: .1, high: .5 }, { low:.2, high: .4}, { low: .3, high: .3 }], 2);
        assert.equal(result.length, 2);
        assert(result[0].low.toFixed(1) === '0.4', `${ result[0].low } is not close to 0.4`);
        assert(result[0].high.toFixed(1) === '0.2', `${ result[0].high } is not close to 0.2`);
        assert(result[1].low.toFixed(1) === '0.5', `${ result[0].low } is not close to 0.5`);
        assert(result[1].high.toFixed(1) === '0.1', `${ result[0].high } is not close to 0.1`);
      });
    });
  });
  describe('.formatData()', () => {
    describe('handles datum', () => {
      it('throws array,datum,object in inputSize > 1', () => {
        const data = [{ input: { one: 1, two: 2 }, output: { three: 3, four: 4 } }];
        const instance = { inputSize: 2, outputSize: 1 };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        });
      });
      it('throws array,datum,object in inputSize > 1', () => {
        const data = [{ input: { one: 1, two: 2 }, output: { three: 3, four: 4 } }];
        const instance = { inputSize: 1, outputSize: 2 };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        });
      });
      it('handles array,datum,object to array,datum,array,array w/ inputSize of 1', () => {
        const data = [{ input: { one: 1, two: 2 }, output: { three: 3, four: 4 } }];
        const instance = { inputSize: 1, outputSize: 1 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [{ input: [Float32Array.from([1]), Float32Array.from([2])], output: [Float32Array.from([3]), Float32Array.from([4])] }]);
      });
      it('throws with array,datum,array', () => {
        const data = [{ input: [1,2], output: [3,4] }];
        const instance = {};
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        });
      });
      it('throws with array,datum,object', () => {
        const data = [{ input: { a: 1, b: 2 }, output: { c: 3, d: 4 } }];
        const instance = { inputSize: 2 };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }, 'Error: unknown data shape or configuration');
      });
      it('throws if array,datum,array,array not sized to match inputSize', () => {
        const data = [{ input: [[1,4,5]], output: [[3,2]] }];
        const instance = {
          inputSize: 2,
          outputSize: 2
        };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }, 'inputSize must match data inputSize');
      });
      it('throws if array,datum,array,array not sized to match outputSize', () => {
        const data = [{ input: [[1,4]], output: [[3,2,1]] }];
        const instance = {
          inputSize: 2,
          outputSize: 2
        };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        }, 'outputSize must match data inputSize');
      });
      it('formats array,datum,array,array to array,datum,array,floatArray', () => {
        const data = [{ input: [[1,4],[2,3]], output: [[3,2],[4,1]] }];
        const instance = {
          inputSize: 2,
          outputSize: 2
        };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [
          {
            input: [Float32Array.from([1,4]), Float32Array.from([2,3])],
            output: [Float32Array.from([3,2]), Float32Array.from([4,1])]
          }
        ]);
      });
      it('formats array,datum,array,object to array,datum,array,floatArray', () => {
        const data = [{ input: [{ a: 1, b: 4 },{ a: 2, b: 3 }], output: [{ c: 3, d: 2 }, { c: 4, d: 1 }] }];
        const instance = {
          inputSize: 2
        };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.equal(JSON.stringify(instance.inputLookup), '{"a":0,"b":1}');
        assert.equal(JSON.stringify(instance.outputLookup), '{"c":0,"d":1}');
        assert.equal(instance.inputLookupLength, 2);
        assert.equal(instance.outputLookupLength, 2);
        assert.deepEqual(result, [
          {
            input: [Float32Array.from([1,4]), Float32Array.from([2,3])],
            output: [Float32Array.from([3,2]), Float32Array.from([4,1])]
          }
        ]);
      });
    });
    describe('arrays', () => {
      it('throws is inputSize > 1', () => {
        const data = [1,2,3,4];
        const instance = { inputSize: 2, outputSize: 1 };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        });
      });
      it('throws is outputSize > 1', () => {
        const data = [1,2,3,4];
        const instance = { inputSize: 1, outputSize: 2 };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        });
      });
      it('formats array to array,floatArray', () => {
        const data = [1,2,3,4];
        const instance = { inputSize: 1, outputSize: 1 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [
          [
            Float32Array.from([1]),
            Float32Array.from([2]),
            Float32Array.from([3]),
            Float32Array.from([4]),
          ]
        ]);
      });
      it('formats array,array to array,floatArray w/ inputSize of 1', () => {
        const data = [[1,2,3,4],[4,3,2,1]];
        const instance = { inputSize: 1, outputSize: 1 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [
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
          ]
        ]);
      });
      it('throws array,array to array,floatArray w/ inputSize greater than data', () => {
        const data = [[1,4],[2,3],[3,2],[4,1]];
        const instance = { inputSize: 3, outputSize: 2 };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        });
      });
      it('throws array,array to array,floatArray w/ outputSize greater than data', () => {
        const data = [[1,4],[2,3],[3,2],[4,1]];
        const instance = { inputSize: 2, outputSize: 3 };
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        });
      });
      it('formats array,array to array,floatArray w/ inputSize greater than 1', () => {
        const data = [[1,4],[2,3],[3,2],[4,1]];
        const instance = { inputSize: 2, outputSize: 2 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [
          [
            Float32Array.from([1,4]),
            Float32Array.from([2,3]),
            Float32Array.from([3,2]),
            Float32Array.from([4,1]),
          ]
        ]);
      });
      it('formats array,array,array to array,array,floatArray w/ inputSize greater than 1', () => {
        const data = [
          [
            [1,5],
            [2,4],
            [3,3],
            [4,2],
            [5,1]
          ],
          [
            [5,9],
            [6,8],
            [7,7],
            [8,6],
            [9,5]
          ],
        ];
        const instance = { inputSize: 2 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [
          [
            Float32Array.from([1,5]),
            Float32Array.from([2,4]),
            Float32Array.from([3,3]),
            Float32Array.from([4,2]),
            Float32Array.from([5,1]),
          ],
          [
            Float32Array.from([5,9]),
            Float32Array.from([6,8]),
            Float32Array.from([7,7]),
            Float32Array.from([8,6]),
            Float32Array.from([9,5]),
          ],
        ]);
      });
    });
  });
  describe('.toFunction()', () => {
    it('processes array same as net w/ inputSize of 1', () => {
      const data = [{input: [1, 2], output: [3, 4]}];
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1
      });
      net.train(data, { iteration: 100, errorThresh: 0.05 });
      const fn = net.toFunction();
      const expected = net.run(data[0].input);
      const result = fn(data[0].input);
      assert.equal(typeof result, 'number');
      assert.deepEqual(result, expected);
    });

    it('processes object same as net w/ inputSize of 1', () => {
      const data = [{ input: { a: 1, b: 2 }, output: { c: 3, d: 4 } }];
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1
      });
      net.train(data, { iteration: 100, errorThresh: 0.05 });
      const fn = net.toFunction();
      const expected = net.run(data[0].input);
      assert.deepEqual(fn(data[0].input), expected);
    });

    it('processes array,object same as net', () => {
      const data = [{ input: [{ a: 1, b: 4 },{ a: 2, b: 3 }], output: [{ c: 3, d: 2 }, { c: 4, d: 1 }] }];
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2
      });
      net.train(data, { iteration: 100, errorThresh: 0.05 });
      const fn = net.toFunction();
      const expected = net.run(data[0].input);
      assert.deepEqual(fn(data[0].input), expected);
    });
    it('processes array same as net', () => {
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1
      });

      //Same test as previous, but combined on a single set
      const trainingData = [
        [.1,.2,.3,.4,.5],
        [.5,.4,.3,.2,.1]
      ];

      const trainResult = net.train(trainingData);
      assert(trainResult.error < 0.09, `error ${ trainResult.error } did not go below 0.09`);
      const closeToFive = net.run([.1,.2,.3,.4]);
      const closeToOne = net.run([.5,.4,.3,.2]);
      const fn = net.toFunction();
      assert(closeToFive.toFixed(1) === '0.5', `${ closeToFive } is not close to 0.5`);
      assert(closeToOne.toFixed(1) === '0.1', `${ closeToOne } is not close to 0.1`);
      assert.equal(fn([.1,.2,.3,.4]), closeToFive);
      assert.equal(fn([.5,.4,.3,.2]), closeToOne);
    });
    it('processes array,array same as net', () => {
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2
      });

      //Same test as previous, but combined on a single set
      const trainingData = [
        [.1,.5],[.2,.4],[.3,.3],[.4,.2],[.5,.1]
      ];

      const trainResult = net.train(trainingData);
      assert(trainResult.error < 0.09, `error ${ trainResult.error } did not go below 0.09`);
      const closeToFiveAndOne = net.run([[.1,.5],[.2,.4],[.3,.3],[.4,.2]]);
      const fn = net.toFunction();
      const result = fn([[.1,.5],[.2,.4],[.3,.3],[.4,.2]]);
      assert(closeToFiveAndOne[0].toFixed(1) === '0.5', `${ closeToFiveAndOne[0] } is not close to 0.5`);
      assert(closeToFiveAndOne[1].toFixed(1) === '0.1', `${ closeToFiveAndOne[1] } is not close to 0.1`);
      assert.equal(result[0], closeToFiveAndOne[0]);
      assert.equal(result[1], closeToFiveAndOne[1]);
    });
    it('processes object same as net', () => {
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [10],
        outputSize: 1
      });

      //Same test as previous, but combined on a single set
      const trainingData = [
        { input: { monday: .1, tuesday: .2, wednesday: .3, thursday: .4 }, output: { friday: .5 } },
        { input: { monday: .5, tuesday: .4, wednesday: .3, thursday: .2 }, output: { friday: .1 } },
      ];
      const trainResult = net.train(trainingData);
      assert(trainResult.error < 0.09, `error ${ trainResult.error } did not go below 0.09`);
      const closeToFive = net.run({ monday: .1, tuesday: .2, wednesday: .3, thursday: .4 });
      const closeToOne = net.run({ monday: .5, tuesday: .4, wednesday: .3, thursday: .2 });
      const fn = net.toFunction();
      assert(closeToFive.friday.toFixed(1) === '0.5', `${ closeToFive.friday } is not close to 0.5`);
      assert(closeToOne.friday.toFixed(1) === '0.1', `${ closeToOne.friday } is not close to 0.1`);
      assert.equal(fn({ monday: .1, tuesday: .2, wednesday: .3, thursday: .4 }).friday, closeToFive.friday);
      assert.equal(fn({ monday: .5, tuesday: .4, wednesday: .3, thursday: .2 }).friday, closeToOne.friday);
    });
  });
  describe('.test()', () => {
    describe('using array,array', () => {
      describe('inputSize of 1', () => {
        it('accumulates no error or misclasses when no error', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1
          });
          sinon.spy(net, 'formatData');
          net.run = sinon.spy((data) => {
            return [.5];
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          const testResult = net.test([
            [.1,.2,.3,.4,.5]
          ]);
          assert(net.formatData.called);
          assert(net.run.called);
          assert.deepEqual(net.run.args[0][0], [[.1],[.2],[.3],[.4]].map(v => Float32Array.from(v)));
          assert.equal(testResult.error, 0);
          assert.equal(testResult.misclasses.length, 0);
        });
        it('accumulates error and misclasses when error', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1
          });
          sinon.spy(net, 'formatData');
          net.run = sinon.spy((data) => {
            return [.1];
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          const testResult = net.test([
            [.1,.2,.3,.4,.5]
          ]);
          assert(net.formatData.called);
          assert(net.run.called);
          assert.deepEqual(net.run.args[0][0], [[.1],[.2],[.3],[.4]].map(v => Float32Array.from(v)));
          assert(testResult.error > .1);
          assert.equal(testResult.misclasses.length, 1);
        });
      });
      describe('inputSize of 2', () => {
        it('throws', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2
          });
          sinon.spy(net, 'formatData');
          net.run = sinon.spy((data) => {
            return [.1];
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          assert.throws(() => {
            const testResult = net.test([
              [.1,.2,.3,.4,.5]
            ]);
          });
          // assert(net.formatData.called);
          // assert(net.run.called);
          // assert.deepEqual(net.run.args[0][0], [[.1],[.2],[.3],[.4]].map(v => Float32Array.from(v)));
          // assert(testResult.error > .1);
          // assert.equal(testResult.misclasses.length, 1);
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
              outputSize: 2
            });
            sinon.spy(net, 'formatData');
            net.run = sinon.spy((data) => {
              return Float32Array.from([.5,.1]);
            });
            net.trainOpts = {
              errorThresh: 0.001
            };
            const testResult = net.test([
              [[.1,.5],[.2,.4],[.3,.3],[.4,.2],[.5,.1]]
            ]);
            assert(net.formatData.called);
            assert(net.run.called);
            assert.equal(testResult.error, 0);
            assert.equal(testResult.misclasses.length, 0);
          });
        });
        describe('some error', () => {
          it('can test', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2
            });
            net.trainOpts = {
              errorThresh: 0.001
            };
            sinon.spy(net, 'formatData');
            net.run = sinon.spy((data) => {
              return Float32Array.from([.1,.5]);
            });
            const testResult = net.test([
              [[.1,.5],[.2,.4],[.3,.3],[.4,.2],[.5,.1]]
            ]);
            assert(net.formatData.called);
            assert(net.run.called);
            assert.ok(testResult.error >= 0.1);
            assert.equal(testResult.misclasses.length, 1);
            assert.deepEqual(testResult.misclasses, [{
              value: [[.1,.5],[.2,.4],[.3,.3],[.4,.2],[.5,.1]],
              actual: Float32Array.from([.1,.5])
            }]);
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
              outputSize: 1
            });
            sinon.spy(net, 'formatData');
            net.forecastNumbers = sinon.spy((data, count) => {
              assert.equal(count, 1);
              return [.5];
            });
            net.trainOpts = {
              errorThresh: 0.001
            };
            net.inputLookup = net.outputLookup = {
              monday: 0,
              tuesday: 1,
              wednesday: 2,
              thursday: 3,
              friday: 4
            };
            net.inputLookupLength = net.outputLookupLength = Object.keys(net.inputLookup).length;
            const testResult = net.test([
              { monday: .1, tuesday: .2, wednesday: .3, thursday: .4, friday: .5 }
            ]);
            assert(net.formatData.called);
            assert(net.forecastNumbers.called);
            assert.deepEqual(net.forecastNumbers.args[0][0], Float32Array.from([.1,.2,.3,.4]));
            assert.deepEqual(net.forecastNumbers.args[0][1], 1);
            assert.equal(testResult.error, 0);
            assert.equal(testResult.misclasses.length, 0);
          });
        });
        describe('some error', () => {
          it('can test w/ forecastNumbers of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [10],
              outputSize: 1
            });
            net.trainOpts = {
              errorThresh: 0.001
            };
            sinon.spy(net, 'formatData');
            net.forecastNumbers = sinon.spy((data, count) => {
              assert(count, 1);
              return [.1];
            });
            net.inputLookup = net.outputLookup = {
              monday: 0,
              tuesday: 1,
              wednesday: 2,
              thursday: 3,
              friday: 4
            };
            net.inputLookupLength = net.outputLookupLength = Object.keys(net.inputLookup).length;
            const testResult = net.test([
              { monday: .1, tuesday: .2, wednesday: .3, thursday: .4, friday: .5 }
            ]);
            assert(net.formatData.called);
            assert(net.forecastNumbers.called);
            assert.deepEqual(net.forecastNumbers.args[0][0], Float32Array.from([.1,.2,.3,.4]));
            assert.ok(testResult.error >= 0.08);
            assert.equal(testResult.misclasses.length, 1);
            assert.deepEqual(testResult.misclasses, [{
              value: { monday: .1, tuesday: .2, wednesday: .3, thursday: .4, friday: .5 },
              actual: { friday: .1 }
            }]);
          });
        });
      });
    });
    describe('using array,array,object',() => {
      describe('inputSize of 2', () => {
        describe('no error', () => {
          it('can test w/ run of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2
            });
            sinon.spy(net, 'formatData');
            net.run = sinon.spy((data) => {
              return { low: .5, high: .1 };
            });
            net.trainOpts = {
              errorThresh: 0.001
            };
            net.inputLookup = net.outputLookup = {
              low: 0,
              high: 1
            };
            net.inputLookupLength = net.outputLookupLength = Object.keys(net.inputLookup).length;
            const testResult = net.test([
              [
                { low: .1, high: .5 },
                { low: .2, high: .4 },
                { low: .3, high: .3 },
                { low: .4, high: .2 },
                { low: .5, high: .1 },
              ]
            ]);
            assert(net.formatData.called);
            assert(net.run.called);
            assert.deepEqual(net.run.args[0][0], [[.1,.5],[.2,.4],[.3,.3],[.4,.2]].map(v => Float32Array.from(v)));
            assert.equal(testResult.error, 0);
            assert.equal(testResult.misclasses.length, 0);
          });
        });
        describe('some error', () => {
          it('can test w/ run of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [10],
              outputSize: 2
            });
            sinon.spy(net, 'formatData');
            net.run = sinon.spy((data) => {
              return { low: .9, high: .9 };
            });
            net.trainOpts = {
              errorThresh: 0.001
            };
            net.inputLookup = net.outputLookup = {
              low: 0,
              high: 1
            };
            net.inputLookupLength = net.outputLookupLength = Object.keys(net.inputLookup).length;
            const testResult = net.test([
              [
                { low: .1, high: .5 },
                { low: .2, high: .4 },
                { low: .3, high: .3 },
                { low: .4, high: .2 },
                { low: .5, high: .1 },
              ]
            ]);
            assert(net.formatData.called);
            assert(net.run.called);
            assert.deepEqual(net.run.args[0][0], [[.1,.5],[.2,.4],[.3,.3],[.4,.2]].map(v => Float32Array.from(v)));
            assert.ok(testResult.error > .3);
            assert.equal(testResult.misclasses.length, 1);
            assert.deepEqual(testResult.misclasses, [{
              value: [
                { low: .1, high: .5 },
                { low: .2, high: .4 },
                { low: .3, high: .3 },
                { low: .4, high: .2 },
                { low: .5, high: .1 },
              ],
              actual: { low: .9, high: .9 }
            }]);
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
            outputSize: 1
          });
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 1);
            return [.5];
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          const testResult = net.test([
            { input: [.1,.2,.3,.4], output: [.5] }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.deepEqual(net.forecast.args[0][0], [[.1],[.2],[.3],[.4]].map(v => Float32Array.from(v)));
          assert.deepEqual(net.forecast.args[0][1], 1);
          assert.equal(testResult.error, 0);
          assert.equal(testResult.misclasses.length, 0);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 2);
            return Float32Array.from([.4,.5]);
          });
          const testResult = net.test([
            { input: [.1,.2,.3], output: [.4,.5] }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.deepEqual(net.forecast.args[0][0], [[.1],[.2],[.3]].map(v => Float32Array.from(v)));
          assert.equal(net.forecast.args[0][1], 2);
          assert.equal(testResult.error, 0);
          assert.equal(testResult.misclasses.length, 0);
        });
      });
      describe('some error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert(count, 1);
            return [.1];
          });
          const testResult = net.test([
            { input: [.1,.2,.3,.4], output: [.5] }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.deepEqual(net.forecast.args[0][0], [[.1],[.2],[.3],[.4]].map(v => Float32Array.from(v)));
          assert.ok(testResult.error >= 0.08);
          assert.equal(testResult.misclasses.length, 1);
          assert.deepEqual(testResult.misclasses, [{
            input: [.1,.2,.3,.4],
            output: [.5],
            actual: [.1]
          }]);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [10],
            outputSize: 1
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 2);
            return [.2,.1];
          });
          const testResult = net.test([
            { input: [.1,.2,.3], output: [.4,.5] }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.ok(testResult.error >= 0.08);
          assert.equal(testResult.misclasses.length, 1);
          assert.deepEqual(testResult.misclasses, [{
            input: [.1,.2,.3,],
            output: [.4,.5],
            actual: [.2,.1]
          }]);
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
              outputSize: 1
            });
            sinon.spy(net, 'formatData');
            net.forecast = sinon.spy((data, count) => {
              assert.equal(count, 1);
              return [.5];
            });
            net.trainOpts = {
              errorThresh: 0.001
            };
            net.inputLookup = {
              monday: 0,
              tuesday: 1,
              wednesday: 2,
              thursday: 3
            };
            net.inputLookupLength = Object.keys(net.inputLookup).length;
            net.outputLookup = {
              friday: 0
            };
            net.outputLookupLength = Object.keys(net.outputLookup).length;
            const testResult = net.test([
              {
                input: { monday: .1, tuesday: .2, wednesday: .3, thursday: .4 },
                output: { friday: .5 }
              }
            ]);
            assert(net.formatData.called);
            assert(net.forecast.called);
            assert.deepEqual(net.forecast.args[0][0], [[.1],[.2],[.3],[.4]].map(v => Float32Array.from(v)));
            assert.deepEqual(net.forecast.args[0][1], 1);
            assert.equal(testResult.error, 0);
            assert.equal(testResult.misclasses.length, 0);
          });
        });
        describe('some error', () => {
          it('can test w/ forecastNumbers of 1', () => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [10],
              outputSize: 1
            });
            net.trainOpts = {
              errorThresh: 0.001
            };
            sinon.spy(net, 'formatData');
            net.forecast = sinon.spy((data, count) => {
              assert(count, 1);
              return [.1];
            });
            net.inputLookup = {
              monday: 0,
              tuesday: 1,
              wednesday: 2,
              thursday: 3
            };
            net.inputLookupLength = Object.keys(net.inputLookup).length;
            net.outputLookup = {
              friday: 0
            };
            net.outputLookupLength = Object.keys(net.outputLookup).length;
            const testResult = net.test([
              {
                input: { monday: .1, tuesday: .2, wednesday: .3, thursday: .4 },
                output: { friday: .5 }
              }
            ]);
            assert(net.formatData.called);
            assert(net.forecast.called);
            assert.deepEqual(net.forecast.args[0][0], [[.1],[.2],[.3],[.4]].map(v => Float32Array.from(v)));
            assert.ok(testResult.error >= 0.08);
            assert.equal(testResult.misclasses.length, 1);
            assert.deepEqual(testResult.misclasses, [{
              input: { monday: .1, tuesday: .2, wednesday: .3, thursday: .4 },
              output: { friday: .5 },
              actual: { friday: .1 }
            }]);
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
            outputSize: 2
          });
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 1);
            return [[.5,.1]].map(v => Float32Array.from(v));
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          const testResult = net.test([
            { input: [[.1,.5],[.2,.4],[.3,.3],[.4,.2]], output: [[.5,.1]] }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.equal(testResult.error, 0);
          assert.equal(testResult.misclasses.length, 0);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2
          });
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 2);
            return [[.4,.2],[.5,.1]].map(v => Float32Array.from(v));
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          const testResult = net.test([
            { input: [[.1,.5],[.2,.4],[.3,.3]], output: [[.4,.2],[.5,.1]] }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.equal(testResult.error, 0);
          assert.equal(testResult.misclasses.length, 0);
        });
      });
      describe('some error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert(count, 1);
            return [[.1,.5]].map(v => Float32Array.from(v));
          });
          const testResult = net.test([
            { input: [[.1,.5],[.2,.4],[.3,.3],[.4,.2]], output: [[.5,.1]] }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.ok(testResult.error >= 0.1);
          assert.equal(testResult.misclasses.length, 1);
          assert.deepEqual(testResult.misclasses, [{
            input: [[.1,.5],[.2,.4],[.3,.3],[.4,.2]],
            output: [[.5,.1]],
            actual: [[.1,.5]].map(v => Float32Array.from(v))
          }]);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2
          });
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 2);
            return [[.9,.9], [.9,.9]].map(v => Float32Array.from(v));
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          const testResult = net.test([
            { input: [[.1,.5],[.2,.4],[.3,.3]], output: [[.4,.2],[.5,.1]] }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.ok(testResult.error >= 0.08);
          assert.equal(testResult.misclasses.length, 1);
          assert.deepEqual(testResult.misclasses, [{
            input: [[.1,.5],[.2,.4],[.3,.3],],
            output: [[.4,.2], [.5,.1]],
            actual: [[.9,.9], [.9,.9]].map(v => Float32Array.from(v))
          }]);
        });
      });
    });
    describe('using array,datum,array,object', () => {
      describe('no error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2
          });
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 1);
            return [{ low: .5, high: .1 }];
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          net.inputLookup = {
            low: 0,
            high: 1
          };
          net.inputLookupLength = Object.keys(net.inputLookup).length;
          net.outputLookup = {
            low: 0,
            high: 1
          };
          net.outputLookupLength = Object.keys(net.outputLookup).length;
          const testResult = net.test([
            {
              input: [{ low: .1, high: .5 }, { low: .2, high: .4 }, { low: .3, high: .3 }, { low: .4, high: .2 }],
              output: [{ low:.5, high: .1 }]
            }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.equal(testResult.error, 0);
          assert.equal(testResult.misclasses.length, 0);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2
          });
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 2);
            return [{ low: .4, high: .2 },{ low: .5, high: .1 }];
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          net.inputLookup = {
            low: 0,
            high: 1
          };
          net.inputLookupLength = Object.keys(net.inputLookup).length;
          net.outputLookup = {
            low: 0,
            high: 1
          };
          net.outputLookupLength = Object.keys(net.outputLookup).length;
          const testResult = net.test([
            {
              input: [{ low: .1, high: .5 }, { low: .2, high: .4 }, { low: .3, high: .3 }],
              output: [{ low: .4, high: .2 }, { low:.5, high: .1 }]
            }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.equal(testResult.error, 0);
          assert.equal(testResult.misclasses.length, 0);
        });
      });
      describe('some error', () => {
        it('can test w/ forecast of 1', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          net.inputLookup = {
            low: 0,
            high: 1
          };
          net.inputLookupLength = Object.keys(net.inputLookup).length;
          net.outputLookup = {
            low: 0,
            high: 1
          };
          net.outputLookupLength = Object.keys(net.outputLookup).length;
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert(count, 1);
            return [{ low: .1, high: .5 }]
          });
          const testResult = net.test([
            {
              input: [{ low: .1, high: .5 }, { low: .2, high: .4 }, { low: .3, high: .3 }, { low: .4, high: .2 }],
              output: [{ low:.5, high: .1 }]
            }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.ok(testResult.error >= 0.1);
          assert.equal(testResult.misclasses.length, 1);
          assert.deepEqual(testResult.misclasses, [{
            input: [{ low: .1, high: .5 }, { low: .2, high: .4 }, { low: .3, high: .3 }, { low: .4, high: .2 }],
            output: [{ low:.5, high: .1 }],
            actual: [{ low:.1, high: .5 }]
          }]);
        });
        it('can test w/ forecast of 2', () => {
          const net = new LSTMTimeStep({
            inputSize: 2,
            hiddenLayers: [10],
            outputSize: 2
          });
          sinon.spy(net, 'formatData');
          net.forecast = sinon.spy((data, count) => {
            assert.equal(count, 2);
            return [{ low: .9, high: .9 }, { low:.9, high: .9 }];
          });
          net.trainOpts = {
            errorThresh: 0.001
          };
          net.inputLookup = {
            low: 0,
            high: 1
          };
          net.inputLookupLength = Object.keys(net.inputLookup).length;
          net.outputLookup = {
            low: 0,
            high: 1
          };
          net.outputLookupLength = Object.keys(net.outputLookup).length;
          const testResult = net.test([
            {
              input: [{ low: .1, high: .5 }, { low: .2, high: .4 }, { low: .3, high: .3 }],
              output: [{ low: .4, high: .2 }, { low:.5, high: .1 }]
            }
          ]);
          assert(net.formatData.called);
          assert(net.forecast.called);
          assert.ok(testResult.error >= 0.08);
          assert.equal(testResult.misclasses.length, 1);
          assert.deepEqual(testResult.misclasses, [{
            input: [{ low: .1, high: .5 }, { low: .2, high: .4 }, { low: .3, high: .3 }],
            output: [{ low: .4, high: .2 }, { low:.5, high: .1 }],
            actual: [{ low: .9, high: .9 }, { low:.9, high: .9 }]
          }]);
        });
      });
    });
  });
  describe('.addFormat()', () => {
    it('array,array,number', () => {
      const instance = {};
      RNNTimeStep.prototype.addFormat.call(instance, [[0]]);
      assert.deepEqual(instance, {});
    });
    it('datum,array,array,number', () => {
      const instance = {};
      RNNTimeStep.prototype.addFormat.call(instance, { input: [[0]], output: [[0]] });
      assert.deepEqual(instance, {});
    });
    it('array,number', () => {
      const instance = {};
      RNNTimeStep.prototype.addFormat.call(instance, [0]);
      assert.deepEqual(instance, {});
    });
    it('datum,array,number', () => {
      const instance = {};
      RNNTimeStep.prototype.addFormat.call(instance, { input: [0], output: [0] });
      assert.deepEqual(instance, {});
    });

    it('datum,object,number', () => {
      const instance = {
        inputLookup: { 'inputOne': 0, },
        outputLookup: { 'outputOne': 0 }
      };
      RNNTimeStep.prototype.addFormat.call(instance, {
        input: { inputTwo: 1, inputThree: 2 },
        output: { outputTwo: 1, outputThree: 2 }
      });
      assert.deepEqual(instance, {
        inputLookup: { inputOne: 0, inputTwo: 1, inputThree: 2 },
        inputLookupLength: 3,
        outputLookup: { outputOne: 0, outputTwo: 1, outputThree: 2 },
        outputLookupLength: 3
      });
    });
    it('object,number', () => {
      const instance = {
        inputLookup: { 'inputOne': 0, }
      };
      RNNTimeStep.prototype.addFormat.call(instance, { inputTwo: 1, inputThree: 2 });
      assert.deepEqual(instance, {
        inputLookup: { inputOne: 0, inputTwo: 1, inputThree: 2 },
        inputLookupLength: 3,
        outputLookup: { inputOne: 0, inputTwo: 1, inputThree: 2 },
        outputLookupLength: 3
      });
    });
    it('array,object,number', () => {});
    it('datum,array,object,number', () => {});
  });
  describe('.toJSON()', () => {
    it('saves network dimensions to json', () => {
      const inputSize = 4;
      const hiddenLayers = [1,2,3];
      const outputSize = 5;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize
      });
      net.initialize();
      const json = net.toJSON();
      assert.equal(json.options.inputSize, inputSize);
      assert.deepEqual(json.options.hiddenLayers, hiddenLayers);
      assert.equal(json.options.outputSize, outputSize);
    });
    it('restores network dimensions from json', () => {
      const inputSize = 45;
      const hiddenLayers = [1,2,3,4,5,6,7,8,9];
      const outputSize = 20;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize
      });
      net.initialize();
      const json = net.toJSON();
      const serializedNet = new RNNTimeStep();
      serializedNet.fromJSON(json);
      assert.equal(serializedNet.inputSize, inputSize);
      assert.deepEqual(serializedNet.hiddenLayers, hiddenLayers);
      assert.equal(serializedNet.outputSize, outputSize);
    });
    it('handles array,object to array,object with lookup tables being same w/ inputSize of 1', () => {
      const inputSize = 1;
      const hiddenLayers = [10];
      const outputSize = 1;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize
      });
      net.train([{ monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 }]);
      const fn = net.toFunction();
      const result = fn({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 });
      assert.deepEqual(result, net.run({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 }));
      assert.equal(Object.keys(result).length, 1);
      assert.equal(result.friday.toFixed(0), '5');
    });
    it('error rate stays same after serialization', () => {
      const inputSize = 1;
      const hiddenLayers = [10];
      const outputSize = 1;
      const net = new RNNTimeStep({
        inputSize,
        hiddenLayers,
        outputSize
      });
      let lastNetStatus;
      const trainingData = [{ monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 }];
      net.train(trainingData, {
        log: (status) => {
          lastNetStatus = status;
        },
        iterations: 50
      });
      net.run({ monday: 1, tuesday: 2, wednesday: 3, thursday: 4 });
      const json = net.toJSON();
      const serializedNet = new RNNTimeStep();
      serializedNet.fromJSON(json);
      let lastSerializedNetStatus;
      serializedNet.train(trainingData, { iterations: 1, log: (status) => {
          lastSerializedNetStatus = status;
      }});
      assert(lastSerializedNetStatus.split(' ').pop() < lastNetStatus.split(' ').pop());
    });
  });
});
