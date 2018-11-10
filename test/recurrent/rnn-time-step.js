import assert from 'assert';
import RNNTimeStep from '../../src/recurrent/rnn-time-step';
import LSTMTimeStep from '../../src/recurrent/lstm-time-step';
import Equation from '../../src/recurrent/matrix/equation';
import sinon from 'sinon';

/* NOTE: TimeStep here is deprecated though being committed as something new, it is the first feature we want using
 recurrent.js because it is simply one of the simplest recurrent neural networks and serves as a baseline to completing
 the GPU architecture.   This test is written so as to create the baseline we can measure against.
 We get this working, we have a baseline, we finish recurrent.js.
  */
describe('RNNTimeStep', () => {
  describe('.train()', () =>{
    describe('using arrays', () => {
      describe('training data with 1D arrays', () => {
        beforeEach(() => {
          sinon.spy(LSTMTimeStep.prototype, 'trainNumbers');
          sinon.spy(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainNumbers.restore();
          Equation.prototype.predictTarget.restore();
        });
        it('uses .runInputNumbers with correct arguments', () => {
          const net = new LSTMTimeStep({
            inputSize: 1,
            hiddenLayers: [1],
            outputSize: 1
          });
          const trainingData = [
            [1,2,3,4,5],
            [5,4,3,2,1]
          ];
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainNumbers.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainNumbers.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainNumbers.args[0][0], trainingData[0]);
          assert.equal(Equation.prototype.predictTarget.callCount, 8);
          assert.equal(net.model.equations.length, 5);

          // first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], [1]);
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], [2]);

          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], [2]);
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], [3]);

          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], [3]);
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], [4]);

          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], [4]);
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], [5]);

          // second array
          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], [5]);
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], [4]);

          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], [4]);
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], [3]);

          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], [3]);
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], [2]);

          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], [2]);
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], [1]);
        });
        it('can learn basic logic', () => {
          return new Promise((resolve) => {
            const net = new LSTMTimeStep({
              inputSize: 1,
              hiddenLayers: [20, 20],
              outputSize: 1
            });
            const trainingData = [
              [1,2,3,4,5],
              [5,4,3,2,1]
            ];
            const result = net.train(trainingData, { errorThresh: 0.05 });
            assert(result.error < 0.05, `error ${ result.error } did not go below 0.05`);
            assert(result.iterations < 1000, `iterations ${ result.iterations } went above 1000`);
            resolve();
          });
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
            [1,5],
            [2,4],
            [3,3],
            [4,2],
            [5,1],
          ];
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainArrays.callCount, 1);
          assert.equal(LSTMTimeStep.prototype.trainArrays.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainArrays.args[0][0], trainingData);
          assert.equal(Equation.prototype.predictTarget.callCount, 4);
          assert.equal(net.model.equations.length, 5);

          // first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], [1, 5]);
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], [2, 4]);

          // second array
          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], [2, 4]);
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], [3, 3]);

          // third array
          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], [3, 3]);
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], [4, 2]);

          // forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], [4, 2]);
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], [5, 1]);
        });

        it('can learn basic logic', () => {
          return new Promise((resolve) => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [20, 20],
              outputSize: 2
            });
            const trainingData = [
              [1,5],
              [2,4],
              [3,3],
              [4,2],
              [5,1],
            ];
            const result = net.train(trainingData, { errorThresh: 0.05 });
            assert(result.error < 0.05, `error ${ result.error } did not go below 0.05`);
            assert(result.iterations < 4000, `iterations ${ result.iterations } went above 4000`);
            resolve();
          });
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
              [1,5],
              [2,4],
              [3,3],
              [4,2],
              [5,1],
            ],
            [
              [5,9],
              [6,8],
              [7,7],
              [8,6],
              [9,5],
            ],
          ];
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainArrays.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainArrays.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainArrays.args[0][0], trainingData[0]);
          assert.deepEqual(LSTMTimeStep.prototype.trainArrays.args[1][0], trainingData[1]);
          assert.equal(Equation.prototype.predictTarget.callCount, 8);
          assert.equal(net.model.equations.length, 5);

          // first set, first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], [1, 5]);
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], [2, 4]);

          // first set, second array
          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], [2, 4]);
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], [3, 3]);

          // first set, third array
          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], [3, 3]);
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], [4, 2]);

          // first set, forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], [4, 2]);
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], [5, 1]);

          // second set, first array
          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], [5, 9]);
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], [6, 8]);

          // second set, second array
          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], [6, 8]);
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], [7, 7]);

          // second set, third array
          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], [7, 7]);
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], [8, 6]);

          // second set, forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], [8, 6]);
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], [9, 5]);
        });

        it('can learn basic logic', () => {
          return new Promise((resolve) => {
            const net = new LSTMTimeStep({
              inputSize: 2,
              hiddenLayers: [20, 20],
              outputSize: 2
            });
            const trainingData = [
              [
                [1,5],
                [2,4],
                [3,3],
                [4,2],
                [5,1],
              ],
              [
                [5,9],
                [6,8],
                [7,7],
                [8,6],
                [9,5],
              ],
            ];
            const result = net.train(trainingData, { errorThresh: 0.05 });
            assert(result.error < 0.05, `error ${ result.error } did not go below 0.05`);
            assert(result.iterations < 4000, `iterations ${ result.iterations } went above 4000`);
            resolve();
          });
        });
      });
    });

    describe('using training input/output objects with arrays', () => {
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
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainInputOutput.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainInputOutput.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutput.args[0][0], trainingData[0]);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutput.args[1][0], trainingData[1]);
          assert.equal(Equation.prototype.predictTarget.callCount, 8);
          assert.equal(net.model.equations.length, 5);

          // first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], [1]);
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], [2]);

          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], [2]);
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], [3]);

          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], [3]);
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], [4]);

          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], [4]);
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], [5]);

          // second array
          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], [5]);
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], [4]);

          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], [4]);
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], [3]);

          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], [3]);
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], [2]);

          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], [2]);
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], [1]);
        });
      });

      describe('training data with 2D arrays', () => {
        beforeEach(() => {
          sinon.spy(LSTMTimeStep.prototype, 'trainInputOutputArray');
          sinon.spy(Equation.prototype, 'predictTarget');
        });
        afterEach(() => {
          LSTMTimeStep.prototype.trainInputOutputArray.restore();
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
                [1,5],
                [2,4],
                [3,3],
                [4,2],
              ],
              output: [[5,1]]
            },
            {
              input: [
                [5,9],
                [6,8],
                [7,7],
                [8,6],
              ],
              output: [[9,5]]
            }
          ];
          net.train(trainingData, { iterations: 1 });
          assert.equal(LSTMTimeStep.prototype.trainInputOutputArray.callCount, 2);
          assert.equal(LSTMTimeStep.prototype.trainInputOutputArray.args[0].length, 1);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutputArray.args[0][0], trainingData[0]);
          assert.deepEqual(LSTMTimeStep.prototype.trainInputOutputArray.args[1][0], trainingData[1]);
          assert.equal(Equation.prototype.predictTarget.callCount, 8);
          assert.equal(net.model.equations.length, 5);

          // first set, first array
          assert.deepEqual(Equation.prototype.predictTarget.args[0][0], [1, 5]);
          assert.deepEqual(Equation.prototype.predictTarget.args[0][1], [2, 4]);

          // first set, second array
          assert.deepEqual(Equation.prototype.predictTarget.args[1][0], [2, 4]);
          assert.deepEqual(Equation.prototype.predictTarget.args[1][1], [3, 3]);

          // first set, third array
          assert.deepEqual(Equation.prototype.predictTarget.args[2][0], [3, 3]);
          assert.deepEqual(Equation.prototype.predictTarget.args[2][1], [4, 2]);

          // first set, forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[3][0], [4, 2]);
          assert.deepEqual(Equation.prototype.predictTarget.args[3][1], [5, 1]);

          // second set, first array
          assert.deepEqual(Equation.prototype.predictTarget.args[4][0], [5, 9]);
          assert.deepEqual(Equation.prototype.predictTarget.args[4][1], [6, 8]);

          // second set, second array
          assert.deepEqual(Equation.prototype.predictTarget.args[5][0], [6, 8]);
          assert.deepEqual(Equation.prototype.predictTarget.args[5][1], [7, 7]);

          // second set, third array
          assert.deepEqual(Equation.prototype.predictTarget.args[6][0], [7, 7]);
          assert.deepEqual(Equation.prototype.predictTarget.args[6][1], [8, 6]);

          // second set, forth array
          assert.deepEqual(Equation.prototype.predictTarget.args[7][0], [8, 6]);
          assert.deepEqual(Equation.prototype.predictTarget.args[7][1], [9, 5]);
        });
      });
    });
  });
  describe.skip('.trainNumbers()', () => {
    it('forward propagates weights', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [1],
        outputSize: 1
      });

      net.initialize();
      net.trainNumbers([1, 2, 3]);

      // net.model.input.weights.forEach((weight, weightIndex) =>
      //   assert.notEqual(weight, 0, `weights is 0 on input weight ${ weightIndex }`));
      net.model.equations.forEach((equation, equationIndex) => {
        equation.states.forEach((state, stateIndex) => {
          // these are recurrent values, or the last input which takes a zero
          if (
            stateIndex === 2
            || stateIndex === 5
            || (equationIndex === 2 && stateIndex === 0)
            || (equationIndex === 2 && stateIndex === 1)
          ) return;
          state.product.weights.forEach((weight, weightIndex) => {
            assert.notEqual(weight, 0, `equation is 0 on equation ${ equationIndex}, state ${ stateIndex }, weight ${ weightIndex }`);
          });
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
      net.trainNumbers([1, 2, 3]);

      net.model.equations.forEach((equation, equationIndex) => {
        equation.states.forEach((state, stateIndex) => {
          if (stateIndex !== equation.states.length - 1) {
            state.product.deltas.forEach((delta, deltaIndex) => {
              assert.equal(delta, 0, `equation is not 0 on equation ${ equationIndex }, state ${ stateIndex }, delta ${ deltaIndex }`);
            });
          }
        });
      });

      // fully propagate inputs back onto deltas
      net.backpropagate();
      net.trainNumbers([1, 2, 3]);
      net.backpropagate();

      net.model.equations.forEach((equation, equationIndex) => {
        if (equationIndex === 2) return;
        equation.states.forEach((state, stateIndex) => {
          if (
            (equationIndex === 2 && stateIndex === 0)
            || (equationIndex === 2 && stateIndex === 1)
            || (equationIndex === 2 && stateIndex === 2)
          ) return;
          state.product.deltas.forEach((delta, deltaIndex) => {
            assert.notEqual(delta, 0, `equation is 0 on equation ${ equationIndex }, state ${ stateIndex }, delta ${ deltaIndex }`);
          });
        });
      });
    });
  });
  describe('using arrays', () => {
    it('can train and predict linear numeric, single input, 1 to 5, and 5 to 1', () => {
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [20, 20],
        outputSize: 1
      });

      const trainingData = [
        [1,2,3,4,5],
        [5,4,3,2,1],
      ];

      const result = net.train(trainingData);
      assert(result.error < 0.05, `error ${ result.error } is not below 0.05`);
      const closeToFive = net.run([1,2,3,4]);
      const closeToOne = net.run([5,4,3,2]);
      assert(Math.round(closeToOne[0]) === 1, `${ closeToOne } does not round to 1`);
      assert(Math.round(closeToFive[0]) === 5, `${ closeToFive } does not round to 5`);
    });
    it('can train and predict single linear array, two input, 1 to 5, and 5 to 1', (done) => {
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [20, 20],
        outputSize: 2
      });

      //Same test as previous, but combined on a single set
      const trainingData = [
        [1,5],
        [2,4],
        [3,3],
        [4,2],
        [5,1]
      ];

      const result = net.train(trainingData, { errorThresh: 0.09 });
      assert(result.error < 0.09, `error ${ result.error } did not go below 0.09`);
      const closeToFiveAndOne = net.run([[1,5],[2,4],[3,3],[4,2]]);
      assert(Math.round(closeToFiveAndOne[0]) === 5, `${ closeToFiveAndOne[0] } does not round to 5`);
      assert(Math.round(closeToFiveAndOne[1]) === 1, `${ closeToFiveAndOne[1] } does not round to 1`);
      done();
    });
    it('can train and predict multiple linear array, two input, 1 to 5, 5 to 1, 5 to 9, and 9 to 5', (done) => {
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [20, 20],
        outputSize: 2
      });

      //Same test as previous, but combined on a single set
      const trainingData = [
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

      const result = net.train(trainingData, { errorThresh: 0.09 });
      assert(result.error < 0.09, `error ${ result.error } did not go below 0.09`);
      const closeToFiveAndOne = net.run([[1,5],[2,4],[3,3],[4,2]]);
      assert(Math.round(closeToFiveAndOne[0]) === 5, `${ closeToFiveAndOne[0] } does not round to 5`);
      assert(Math.round(closeToFiveAndOne[1]) === 1, `${ closeToFiveAndOne[1] } does not round to 1`);
      const closeToNineAndFive = net.run([[5,9],[6,8],[7,7],[8,6]]);
      assert(Math.round(closeToNineAndFive[0]) === 9, `${ closeToNineAndFive[0] } does not round to 9`);
      assert(Math.round(closeToNineAndFive[1]) === 5, `${ closeToNineAndFive[1] } does not round to 5`);
      done();
    });
  });
  describe('using training input/output objects with arrays', () => {
    it('can use inputs(4) and output(1)', (done) => {
      const net = new LSTMTimeStep({
        inputSize: 1,
        hiddenLayers: [20, 20],
        outputSize: 1
      });

      //Same test as previous, but combined on a single set
      const trainingData = [
        {
          input: [1,2,3,4],
          output: [5]
        },
        {
          input: [5,4,3,2],
          output: [1]
        }
      ];

      const result = net.train(trainingData, { errorThresh: 0.09 });
      assert(result.error < 0.09, `error ${ result.error } did not go below 0.09`);
      const closeToFive = net.run([1,2,3,4]);
      const closeToOne = net.run([5,4,3,2]);
      assert(Math.round(closeToFive[0]) === 5, `${ closeToFive[0] } does not round to 5`);
      assert(Math.round(closeToOne[0]) === 1, `${ closeToOne[0] } does not round to 1`);
      done();
    });
    it('can train and predict using array of input and output, two input, 1 to 5, and 5 to 1', (done) => {
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [20, 20],
        outputSize: 2
      });

      //Same test as previous, but combined on a single set
      const trainingData = [
        {
          input: [[1,5],[2,4],[3,3],[4,2]],
          output: [[5, 1]]
        }
      ];

      const result = net.train(trainingData, { errorThresh: 0.09 });
      assert(result.error < 0.09, `error ${ result.error } did not go below 0.09`);
      const closeToFiveAndOne = net.run([[1,5],[2,4],[3,3],[4,2]]);
      assert(Math.round(closeToFiveAndOne[0]) === 5, `${ closeToFiveAndOne[0] } does not round to 5`);
      assert(Math.round(closeToFiveAndOne[1]) === 1, `${ closeToFiveAndOne[1] } does not round to 1`);
      done();
    });
  });
  describe('.forecast()', () => {
    describe('using numbers', () => {
      it('can use an input of numbers of length 3 and give an output of length 2', (done) => {
        const net = new LSTMTimeStep({
          inputSize: 1,
          hiddenLayers: [20,20],
          outputSize: 1
        });

        //Same test as previous, but combined on a single set
        const trainingData = [
          {
            input: [1,2,3],
            output: [4,5]
          },
          {
            input: [5,4,3],
            output: [2,1]
          }
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.09 });
        assert(trainResult.error < 0.09, `error ${ trainResult.error } did not go below 0.09`);
        const result1 = net.forecast([1,2,3], 2);
        assert.equal(result1.length, 2);
        assert(Math.round(result1[0]) === 4, `${ result1[0] } does not round to 4`);
        assert(Math.round(result1[1]) === 5, `${ result1[1] } does not round to 5`);

        const result2 = net.forecast([5,4,3], 2);
        assert.equal(result2.length, 2);
        assert(Math.round(result2[0]) === 2, `${ result2[0] } does not round to 2`);
        assert(Math.round(result2[1]) === 1, `${ result2[1] } does not round to 1`);

        done();
      });
    });
    describe('using arrays', () => {
      it('can use an input array of length 3 and give an output of length 2', (done) => {
        const net = new LSTMTimeStep({
          inputSize: 2,
          hiddenLayers: [20,20],
          outputSize: 2
        });

        //Same test as previous, but combined on a single set
        const trainingData = [
          {
            input: [[1,5],[2,4],[3,3]],
            output: [[4,2],[5, 1]]
          }
        ];

        const trainResult = net.train(trainingData, { errorThresh: 0.09 });
        assert(trainResult.error < 0.09, `error ${ trainResult.error } did not go below 0.09`);
        const result = net.forecast([[1,5],[2,4],[3,3]], 2);
        assert.equal(result.length, 2);
        assert(Math.round(result[0][0]) === 4, `${ result[0][0] } does not round to 4`);
        assert(Math.round(result[0][1]) === 2, `${ result[0][1] } does not round to 2`);
        assert(Math.round(result[1][0]) === 5, `${ result[0][0] } does not round to 5`);
        assert(Math.round(result[1][1]) === 1, `${ result[0][1] } does not round to 1`);
        done();
      });
    });
  });
  describe('.trainNumbers()', () => {
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
  describe('.toFunction', () => {
    it('outputs exactly what net outputs', (done) => {
      const net = new LSTMTimeStep({
        inputSize: 2,
        hiddenLayers: [10],
        outputSize: 2
      });

      //Same test as previous, but combined on a single set
      const trainingData = [
        [1,5],[2,4],[3,3],[4,2],[5,1]
      ];

      const trainResult = net.train(trainingData, { errorThresh: 0.09 });
      assert(trainResult.error < 0.09, `error ${ trainResult.error } did not go below 0.09`);
      const closeToFiveAndOne = net.run([[1,5],[2,4],[3,3],[4,2]]);
      const fn = net.toFunction();
      const result = fn([[1,5],[2,4],[3,3],[4,2]]);
      assert(Math.round(closeToFiveAndOne[0]) === 5, `${ closeToFiveAndOne[0] } does not round to 5`);
      assert(Math.round(closeToFiveAndOne[1]) === 1, `${ closeToFiveAndOne[1] } does not round to 1`);
      assert.equal(result[0], closeToFiveAndOne[0]);
      assert.equal(result[1], closeToFiveAndOne[1]);
      done();
    });
  });
});