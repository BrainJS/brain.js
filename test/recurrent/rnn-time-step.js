import assert from 'assert';
import RNNTimeStep from '../../src/recurrent/rnn-time-step';
import LSTMTimeStep from "../../src/recurrent/lstm-time-step";

/* NOTE: TimeStep here is deprecated though being committed as something new, it is the first feature we want using
 recurrent.js because it is simply one of the simplest recurrent neural networks and serves as a baseline to completing
 the GPU architecture.   This test is written so as to create the baseline we can measure against.
 We get this working, we have a baseline, we finish recurrent.js.
  */
describe('RNNTimeStep', () => {
  describe('.runInput()', () => {
    it('creates the correct size equations', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [20],
        outputSize: 1
      });

      net.initialize();
      net.bindEquation();
      net.runInput([1, 2, 0]);
      assert.equal(net.model.equations.length, 2);
    });
    it('copies weights to deltas on end of equation', () => {
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
      net.runInput([1, 2, 1]);
      assert.equal(net.model.equations.length, 2);
      assert.notDeepEqual(originalDeltas0, equationOutput0.product.deltas);
      assert.notDeepEqual(originalDeltas1, equationOutput1.product.deltas);
      assert.notDeepEqual(equationOutput0.product.deltas, equationOutput1.product.deltas);
    });
    it('forward propagates weights', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [20],
        outputSize: 1
      });

      net.initialize();
      net.bindEquation();
      net.bindEquation();

      net.runInput([1, 1, 1]);

      net.model.input.weights.forEach((weight, weightIndex) =>
        assert.notEqual(weight, 0, `weights is 0 on input weight ${ weightIndex }`));
      net.model.equations.forEach((equation, equationIndex) =>
        equation.states.forEach((state, stateIndex) =>
          state.product.weights.forEach((weight, weightIndex) =>
            assert.notEqual(weight, 0, `equation is 0 on equation ${ equation } ${ equationIndex}, state ${ stateIndex }, weight ${ weightIndex }`))));
    });
    it('back propagates deltas', () => {
      const net = new RNNTimeStep({
        inputSize: 1,
        hiddenLayers: [20],
        outputSize: 1
      });

      net.initialize();
      net.bindEquation();
      net.bindEquation();

      net.runInput([1, 1, 1]);

      net.model.input.deltas.forEach((delta, deltaIndex) =>
        assert.equal(delta, 0, `deltas is not 0 on input delta ${ deltaIndex }`));
      net.model.equations.forEach((equation, equationIndex) =>
        equation.states.forEach((state, stateIndex) =>
          stateIndex === equation.states.length - 1
            ? null
            : state.product.deltas.forEach((delta, deltaIndex) =>
              assert.equal(delta, 0, `equation is not 0 on equation ${ equationIndex}, state ${ stateIndex }, delta ${ deltaIndex }`))));

      net.runBackpropagate();

      net.model.input.deltas.forEach((delta, deltaIndex) =>
        assert.notEqual(delta, 0, `deltas is 0 on input delta ${ deltaIndex }`));
      net.model.equations.forEach((equation, equationIndex) =>
        equation.states.forEach((state, stateIndex) =>
          state.product.deltas.forEach((delta, deltaIndex) =>
            assert.notEqual(delta, 0, `equation is 0 on equation ${ equationIndex}, state ${ stateIndex }, delta ${ deltaIndex }`))));
    });
  });
  it('can learn to predict forwards and backwards', () => {
    const net = new LSTMTimeStep({
      inputSize: 1,
      hiddenLayers: [20],
      outputSize: 1
    });

    const trainingData = [
      [1,2,3,4,5],
      [5,4,3,2,1],
    ];

    net.train(trainingData);

    const closeToFive = net.run([1,2,3,4]);
    const closeToOne = net.run([4,3,2,1]);
    assert(Math.round(closeToFive) === 5, `${ closeToFive } does not round to 5`);
    assert(Math.round(closeToOne) === 1, `${ closeToOne } does not round to 1`);
  });
  it('can learn more than one to predict forwards and backwards', (done) => {
    const net = new LSTMTimeStep({
      inputSize: 2,
      hiddenLayers: [10],
      outputSize: 2
    });

    //Same test as previous, but combined on a single set
    const trainingData = [
      [[1,5],[2,4],[3,3],[4,2],[5,1]]
    ];

    net.train(trainingData, { log: true, errorThresh: 0.09 });

    const closeToFiveAndOne = net.run([[1,5],[2,4],[3,3],[4,2]]);
    assert(Math.round(closeToFiveAndOne[0]) === 5, `${ closeToFiveAndOne[0] } does not round to 5`);
    assert(Math.round(closeToFiveAndOne[1]) === 1, `${ closeToFiveAndOne[1] } does not round to 1`);
    done();
  });
});