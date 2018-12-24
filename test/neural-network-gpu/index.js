import assert from 'assert';
import NeuralNetwork from '../../src/neural-network';
import NeuralNetworkGPU from '../../src/neural-network-gpu';
import sinon from 'sinon';

describe('NeuralNetworkGPU', () => {
  const xorTrainingData = [
    { input: [0, 1], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] },
    { input: [1, 0], output: [1] }];

  it('can learn xor', () => {
    const net = new NeuralNetworkGPU();
    const status = net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
    assert(status.error < 0.01);
    assert(status.iterations < 5000);
  });

  describe('.toJSON()', () => {
    it('can serialize & deserialize JSON', () => {
      const net = new NeuralNetworkGPU();
      net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
      const target = xorTrainingData.map(datum => net.run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetworkGPU();
      net2.fromJSON(json);
      const output = xorTrainingData.map(datum => net2.run(datum.input));
      assert.deepEqual(output, target);
    });

    it('can serialize from NeuralNetworkGPU & deserialize to NeuralNetwork', () => {
      const net = new NeuralNetworkGPU();
      net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
      const target = xorTrainingData.map(datum => net.run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetwork();
      net2.fromJSON(json);
      const output = xorTrainingData.map(datum => net2.run(datum.input));
      assert.deepEqual(output, target);
    });

    it('can serialize from NeuralNetwork & deserialize to NeuralNetworkGPU', () => {
      const net = new NeuralNetwork();
      net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
      const target = xorTrainingData.map(datum => net.run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetworkGPU();
      net2.fromJSON(json);
      const output = xorTrainingData.map(datum => net2.run(datum.input));
      assert.deepEqual(output, target);
    });

    describe('mocked GPU mode', () => {
      let parentToJson;
      beforeEach(() => {
        parentToJson = sinon.spy(NeuralNetwork.prototype, 'toJSON');
      });
      afterEach(() => {
        NeuralNetwork.prototype.toJSON.restore();
      });
      it('calls .toArray() from GPU instances, and returns values to NeuralNetwork via a jit instance', () => {
        const mockedWeight = {
          toArray: sinon.stub().returns([[4], [5], [6]])
        };
        const mockedWeights = [null, mockedWeight];
        const mockedBias = {
          toArray: sinon.stub().returns([3,2,1])
        };
        const mockedBiases = [null, mockedBias];
        const getTrainOptsJsonStub = sinon.stub().returns({
          activation: 'sigmoid'
        });
        const json = NeuralNetworkGPU.prototype.toJSON.call({
          sizes: [1,3,1],
          outputLayer: 1,
          weights: mockedWeights,
          biases: mockedBiases,
          inputLookup: null,
          outputLookup: null,
          getTrainOptsJSON: getTrainOptsJsonStub
        });
        assert(mockedWeight.toArray.called);
        assert(mockedBias.toArray.called);
        assert.deepEqual(json.layers, [
          { '0': {} },
          {
            '0': { bias: 3, weights: { '0': 4 } },
            '1': { bias: 2, weights: { '0': 5 } },
            '2': { bias: 1, weights: { '0': 6 } }
          }
        ]);
      });
    });
  });

  describe('.toFunction()', () => {
    it('creates a function equivalent to that of NeuralNetwork', () => {
      const net = new NeuralNetwork();
      net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
      const run = net.toFunction();
      const target = xorTrainingData.map(datum => run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetworkGPU();
      net2.fromJSON(json);
      const run2 = net2.toFunction();
      const output = xorTrainingData.map(datum => run2(datum.input));
      assert.deepEqual(output, target);
    });
  });

  describe('.trainPattern()', () => {
    describe('when called with logErrorRate = falsey', () => {
      it('calls .runInput(), .calculateDeltas(), and .adjustWeights()', () => {
        const net = new NeuralNetworkGPU();
        net.runInput = sinon.stub();
        net.calculateDeltas = sinon.stub();
        net.adjustWeights = sinon.stub();
        net.getMSE = sinon.stub();

        net.trainPattern({ input: 'input', output: 'output' });

        assert.ok(net.runInput.called);
        assert.equal(net.runInput.args[0], 'input');

        assert.ok(net.calculateDeltas.called);
        assert.equal(net.calculateDeltas.args[0], 'output');

        assert.ok(net.adjustWeights.called);

        assert.ok(net.getMSE.called === false);
      });
    });
    describe('when called with logErrorRate = truthy', () => {
      it('calls .runInput(), .calculateDeltas(), and .adjustWeights()', () => {
        const net = new NeuralNetworkGPU();
        net.runInput = sinon.stub();
        net.calculateDeltas = sinon.stub();
        net.adjustWeights = sinon.stub();
        net.getMSE = sinon.stub();
        net.getMSE.returns([1]);
        net.outputLayer = 0;
        net.errors = { '0': {} };

        net.trainPattern({ input: 'input', output: 'output' }, true);

        assert.ok(net.runInput.called);
        assert.equal(net.runInput.args[0], 'input');

        assert.ok(net.calculateDeltas.called);
        assert.equal(net.calculateDeltas.args[0], 'output');

        assert.ok(net.adjustWeights.called);

        assert.ok(net.getMSE.called);
      });
    });
  });
});
