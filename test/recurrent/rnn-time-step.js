import assert from 'assert';
import RNNTimeStep from '../../src/recurrent/rnn-time-step';
import LSTMTimeStep from '../../src/recurrent/lstm-time-step';
import Equation from '../../src/recurrent/matrix/equation';
import sinon from 'sinon';

describe.only('RNNTimeStep', () => {
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
        assert.equal(net.forecast, stub);
      });
    });
  });
  describe('.train()', () => {
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

    describe('calling using training input/output objects with arrays', () => {
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
        assert(closeToOne[0].toFixed(1) === '0.1', `${ closeToOne } is not close to 0.1`);
        assert(closeToFive[0].toFixed(1) === '0.5', `${ closeToFive } is not close to 0.5`);
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
        it('can use inputs(4) and output(1)', (done) => {
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
          assert(closeToFive[0].toFixed(1) === '0.5', `${ closeToFive[0] } is not close to 0.5`);
          assert(closeToOne[0].toFixed(1) === '0.1', `${ closeToOne[0] } is not close to 0.1`);
          done();
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
  });
  describe('.formatData()', () => {
    describe('input/output', () => {
      it('handles [{ input: object, output: object }] to [{ input: Float32Array, output: Float32Array }] w/ input size of 1', () => {
        const data = [{ input: { one: 1, two: 2 }, output: { three: 3, four: 4 } }];
        const instance = { inputSize: 1 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [{ input: [Float32Array.from([1]), Float32Array.from([2])], output: [Float32Array.from([3]), Float32Array.from([4])] }]);
      });
      it('cannot handle [{ input: number[], output: number[] }] to [{ input: Float32Array, output: Float32Array }]', () => {
        const data = [{ input: [1,2], output: [3,4] }];
        const instance = {};
        assert.throws(() => {
          RNNTimeStep.prototype.formatData.apply(instance, [data]);
        });
      });
      it('handles [{ input: object, output: object }] to [{ input: Float32Array, output: Float32Array }]', () => {
        const data = [{ input: { a: 1, b: 2 }, output: { c: 3, d: 4 } }];
        const instance = { inputSize: 2 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.equal(JSON.stringify(instance.inputLookup), '{"a":0,"b":1}');
        assert.equal(JSON.stringify(instance.outputLookup), '{"c":0,"d":1}');
        assert.equal(instance.inputLookupLength, 2);
        assert.equal(instance.outputLookupLength, 2);
        assert.deepEqual(result, [{ input: Float32Array.from([1,2]), output: Float32Array.from([3,4]) }]);
      });
      it('handles [{ input: number[][], output: number[][] }] to [{ input: Float32Array[], output: Float32Array[] }]', () => {
        const data = [{ input: [[1,4],[2,3]], output: [[3,2],[4,1]] }];
        const instance = {
          inputSize: 2
        };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [
          {
            input: [Float32Array.from([1,4]), Float32Array.from([2,3])],
            output: [Float32Array.from([3,2]), Float32Array.from([4,1])]
          }
        ]);
      });
      it('handles [{ input: object[], output: object[] }] to [{ input: Float32Array[], output: Float32Array[] }]', () => {
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
      it('handles number[] to Float32Array[]', () => {
        const data = [1,2,3,4];
        const instance = { inputSize: 1 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [
          Float32Array.from([1]),
          Float32Array.from([2]),
          Float32Array.from([3]),
          Float32Array.from([4]),
        ]);
      });
      it('handles number[][] to Float32Array[][] w/ input size of 1', () => {
        const data = [[1,2,3,4],[4,3,2,1]];
        const instance = { inputSize: 1 };
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
      it('handles number[][] to Float32Array[][] w/ input size greater than 1', () => {
        const data = [[1,4],[2,3],[3,2],[4,1]];
        const instance = { inputSize: 2 };
        const result = RNNTimeStep.prototype.formatData.apply(instance, [data]);
        assert.deepEqual(result, [
          Float32Array.from([1,4]),
          Float32Array.from([2,3]),
          Float32Array.from([3,2]),
          Float32Array.from([4,1]),
        ]);
      });
      it('handles number[][][] to Float32Array[][][] w/ input size greater than 1', () => {
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
  describe.skip('.toFunction()', () => {
    describe('input/output', () => {
      it('does not handle [{ input: number[], output: number[] }] w/ input size of 2', () => {
        const data = [{input: [1, 2], output: [3, 4]}];
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [10],
          outputSize: 2
        });
        assert.throws(() => {
          net.train(data, { iteration: 100, errorThresh: 0.05 });
        });
      });

      it('does not handle [{ input: number[], output: number[] }] w/ input size of 1', () => {
        const data = [{input: [1, 2], output: [3, 4]}];
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

      it('handles [{ input: object, output: object }]', () => {
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

      it('handles [{ input: number[][], output: number[][] }]', () => {
        const data = [{ input: [[1,4],[2,3]], output: [[3,2],[4,1]] }];
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [10],
          outputSize: 2
        });
        net.train(data, { iteration: 100, errorThresh: 0.05 });
        const fn = net.toFunction();
        assert.deepEqual(fn(data[0].input), net.run(data[0].input));
      });

      it('handles [{ input: object[], output: object[] }]', () => {
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
    });
    describe('arrays', () => {
      it('handles number[]', () => {
        const data = [1,2,3,4];
      });

      it('handles number[][] w/ input size of 1', () => {
        const data = [[1, 2, 3, 4], [4, 3, 2, 1]];
      });

      it('handles number[][] w/ input size greater than 1', () => {
        const data = [[1,4],[2,3],[3,2],[4,1]];
      });

      it('handles number[][][] w/ input size greater than 1', () => {
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
      });
    });
    describe('handles numbers', () => {
      it('outputs exactly what net outputs', () => {
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
        assert(closeToFive[0].toFixed(1) === '0.5', `${ closeToFive[0] } is not close to 0.5`);
        assert(closeToOne[0].toFixed(1) === '0.1', `${ closeToOne[0] } is not close to 0.1`);
        assert.equal(fn([.1,.2,.3,.4])[0], closeToFive[0]);
        assert.equal(fn([.5,.4,.3,.2])[0], closeToOne[0]);
      });
    });
    describe('handles arrays', () => {
      it('outputs exactly what net outputs', () => {
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
    });
    describe('handles input/output arrays', () => {
      it('outputs exactly what net outputs', () => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [10],
          outputSize: 2
        });

        //Same test as previous, but combined on a single set
        const trainingData = [
          { input: [[.1,.5],[.2,.4],[.3,.3]], output: [[.4,.2],[.5,.1]] }
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
    });
    describe('handles input/output objects', () => {
      it('outputs exactly what net outputs', () => {
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
  });
});