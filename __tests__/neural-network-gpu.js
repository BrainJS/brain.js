const NeuralNetwork = require('../src/neural-network');
const NeuralNetworkGPU = require('../src/neural-network-gpu');

describe('NeuralNetworkGPU', () => {
  const xorTrainingData = [
    { input: [0, 1], output: [1] },
    { input: [0, 0], output: [0] },
    { input: [1, 1], output: [0] },
    { input: [1, 0], output: [1] },
  ];

  it('can learn xor', () => {
    const net = new NeuralNetworkGPU();
    const status = net.train(xorTrainingData, {
      iterations: 5000,
      errorThresh: 0.01,
    });
    expect(status.error).toBeLessThan(0.01);
    expect(status.iterations).toBeLessThan(5000);
  });

  describe('.toJSON()', () => {
    it('can serialize & deserialize JSON', () => {
      const net = new NeuralNetworkGPU();
      net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
      const target = xorTrainingData.map((datum) => net.run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetworkGPU();
      net2.fromJSON(json);
      const output = xorTrainingData.map((datum) => net2.run(datum.input));
      expect(output).toEqual(target);
    });

    it('can serialize from NeuralNetworkGPU & deserialize to NeuralNetwork', () => {
      const net = new NeuralNetworkGPU();
      net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
      const target = xorTrainingData.map((datum) => net.run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetwork();
      net2.fromJSON(json);
      for (let i = 0; i < xorTrainingData.length; i++) {
        // there is a wee bit of loss going from GPU to CPU
        expect(net2.run(xorTrainingData[i].input)[0]).toBeCloseTo(
          target[i][0],
          5
        );
      }
    });

    it('can serialize from NeuralNetwork & deserialize to NeuralNetworkGPU', () => {
      const net = new NeuralNetwork();
      net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
      const target = xorTrainingData.map((datum) => net.run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetworkGPU();
      net2.fromJSON(json);
      for (let i = 0; i < xorTrainingData.length; i++) {
        // there is a wee bit of loss going from CPU to GPU
        expect(net2.run(xorTrainingData[i].input)[0]).toBeCloseTo(
          target[i][0],
          5
        );
      }
    });

    describe('mocked GPU mode', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let parentToJson;
      beforeEach(() => {
        parentToJson = jest.spyOn(NeuralNetwork.prototype, 'toJSON');
      });
      afterEach(() => {
        NeuralNetwork.prototype.toJSON.mockRestore();
      });
      it('calls .toArray() from GPU instances, and returns values to NeuralNetwork via a jit instance', () => {
        const mockedWeight = {
          toArray: jest.fn(() => [[4], [5], [6]]),
        };
        const mockedWeights = [null, mockedWeight];
        const mockedBias = {
          toArray: jest.fn(() => [3, 2, 1]),
        };
        const mockedBiases = [null, mockedBias];
        const getTrainOptsJsonStub = jest.fn(() => {
          return {
            activation: 'sigmoid',
          };
        });
        const json = NeuralNetworkGPU.prototype.toJSON.call({
          sizes: [1, 3, 1],
          outputLayer: 1,
          weights: mockedWeights,
          biases: mockedBiases,
          inputLookup: null,
          outputLookup: null,
          getTrainOptsJSON: getTrainOptsJsonStub,
        });
        expect(mockedWeight.toArray).toBeCalled();
        expect(mockedBias.toArray).toBeCalled();
        expect(json.layers).toEqual([
          { '0': {} },
          {
            '0': { bias: 3, weights: { '0': 4 } },
            '1': { bias: 2, weights: { '0': 5 } },
            '2': { bias: 1, weights: { '0': 6 } },
          },
        ]);
      });
    });
  });

  describe.skip('.toFunction()', () => {
    it('creates a function equivalent to that of NeuralNetwork', () => {
      const net = new NeuralNetwork();
      net.train(xorTrainingData, { iterations: 5000, errorThresh: 0.01 });
      const run = net.toFunction();
      const target = xorTrainingData.map((datum) => run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetworkGPU();
      net2.fromJSON(json);
      const run2 = net2.toFunction();
      const output = xorTrainingData.map((datum) => run2(datum.input));
      expect(output).toEqual(target);
    });
  });

  describe('.trainPattern()', () => {
    describe('when called with logErrorRate = falsey', () => {
      it('calls .runInput(), .calculateDeltas(), and .adjustWeights()', () => {
        const net = new NeuralNetworkGPU();
        net.runInput = jest.fn();
        net.calculateDeltas = jest.fn();
        net.adjustWeights = jest.fn();
        net.getMSE = jest.fn();

        net.trainPattern({ input: 'input', output: 'output' });

        expect(net.runInput).toBeCalled();
        expect(net.runInput.mock.calls[0][0]).toEqual('input');

        expect(net.calculateDeltas).toBeCalled();
        expect(net.calculateDeltas.mock.calls[0][0]).toEqual('output');

        expect(net.adjustWeights).toBeCalled();

        expect(net.getMSE).not.toBeCalled();
      });
    });
    describe('when called with logErrorRate = truthy', () => {
      it('calls .runInput(), .calculateDeltas(), and .adjustWeights()', () => {
        const net = new NeuralNetworkGPU();
        net.runInput = jest.fn();
        net.calculateDeltas = jest.fn();
        net.adjustWeights = jest.fn();
        net.getMSE = jest.fn(() => [1]);
        net.outputLayer = 0;
        net.errors = { '0': {} };

        net.trainPattern({ input: 'input', output: 'output' }, true);

        expect(net.runInput).toBeCalled();
        expect(net.runInput.mock.calls[0][0]).toEqual('input');

        expect(net.calculateDeltas).toBeCalled();
        expect(net.calculateDeltas.mock.calls[0][0]).toEqual('output');

        expect(net.adjustWeights).toBeCalled();

        expect(net.getMSE).toBeCalled();
      });
    });
  });
});
