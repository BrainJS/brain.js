import { NeuralNetwork } from '../src/neural-network';
import { NeuralNetworkGPU } from '../src/neural-network-gpu';
import { Texture } from 'gpu.js';

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
      net.train(xorTrainingData, { iterations: 1 });
      const target = xorTrainingData.map((datum) => net.run(datum.input));
      const json = net.toJSON();
      const net2 = new NeuralNetworkGPU();
      net2.fromJSON(json);
      const output = xorTrainingData.map((datum) => net2.run(datum.input));
      expect(output).toEqual(target);
    });

    it('can serialize from NeuralNetworkGPU & deserialize to NeuralNetwork', () => {
      const net = new NeuralNetworkGPU();
      net.train(xorTrainingData, { iterations: 1 });
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
      net.train(xorTrainingData, { iterations: 1 });
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
      it('converts Textures to Arrays of numbers', () => {
        const net = new NeuralNetworkGPU();
        net.train([
          { input: [1,2], output: [3] },
          { input: [2,1], output: [0] },
          { input: [3,1], output: [1] }
        ], { iterations: 1 });
        expect(net.weights.length).toBe(3);
        for (let i = 1; i < net.weights.length; i++) {
          expect(net.weights[i] instanceof Texture).toBeTruthy();
        }
        expect(net.biases.length).toBe(3);
        for (let i = 1; i < net.biases.length; i++) {
          expect(net.biases[i] instanceof Texture).toBeTruthy();
        }
        const json = net.toJSON();
        expect(json.layers.length).toBe(3);
        for (let i = 1; i < json.layers.length; i++) {
          const layer = json.layers[i];
          expect(layer.weights).toBeInstanceOf(Array);
          expect(layer.weights[0]).toBeInstanceOf(Array);
          expect(typeof layer.weights[0][0]).toBe('number');
          expect(layer.biases).toBeInstanceOf(Array);
          expect(typeof layer.biases[0]).toBe('number');
        }
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
    let mockAdjustWeights: jest.SpyInstance;
    beforeEach(() => {
      mockAdjustWeights = jest.spyOn(NeuralNetworkGPU.prototype, 'adjustWeights');
    });
    afterEach(() => {
      mockAdjustWeights.mockRestore();
    });
    describe('when called with logErrorRate = falsey', () => {
      it('calls .runInput(), .calculateDeltas(), and .adjustWeights()', () => {
        const net = new NeuralNetworkGPU({ inputSize: 1, hiddenLayers: [2], outputSize: 3 });
        net.initialize();
        const mockRunInput = jest.spyOn(net, 'runInput');
        const mockCalculateDeltas = jest.spyOn(net, 'calculateDeltas');
        const mockGetMSE = jest.spyOn(net, 'getMSE');
        net.trainPattern({ input: [123], output: [321] });

        expect(mockRunInput).toBeCalled();
        expect(mockRunInput.mock.calls[0][0]).toEqual([123]);

        expect(mockCalculateDeltas).toBeCalled();
        expect(mockCalculateDeltas.mock.calls[0][0]).toEqual([321]);

        expect(mockAdjustWeights).toBeCalled();
        expect(mockGetMSE).not.toBeCalled();
      });
    });
    describe('when called with logErrorRate = truthy', () => {
      it('calls .runInput(), .calculateDeltas(), and .adjustWeights()', () => {
        const net = new NeuralNetworkGPU({ inputSize: 1, hiddenLayers: [2], outputSize: 3 });
        net.initialize();
        const mockRunInput = jest.spyOn(net, 'runInput');
        const mockCalculateDeltas = jest.spyOn(net, 'calculateDeltas');
        const mockGetMSE = jest.spyOn(net, 'getMSE');

        net.trainPattern({ input: [123], output: [321] }, true);

        expect(mockRunInput).toBeCalled();
        expect(mockRunInput.mock.calls[0][0]).toEqual([123]);

        expect(mockCalculateDeltas).toBeCalled();
        expect(mockCalculateDeltas.mock.calls[0][0]).toEqual([321]);

        expect(mockAdjustWeights).toBeCalled();

        expect(mockGetMSE).toBeCalled();
      });
    });
  });
});
