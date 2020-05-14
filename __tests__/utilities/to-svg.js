const NeuralNetwork = require('../../src/neural-network');
const RNN = require('../../src/recurrent/rnn');
const RNNTimeStep = require('../../src/recurrent/rnn-time-step');
const toSVG = require('../../src/utilities/to-svg');
const { FeedForward } = require('../../src/feed-forward');
const { Recurrent } = require('../../src/recurrent');
const parser = require('fast-xml-parser');
const { input, feedForward, target } = require('../../src/layer');

describe('svg', () => {
  const options = {
    height: 200,
    width: 300,
    r: 4,
    line: {
      width: 0.5,
      color: 'black',
      className: 'test-connection',
    },
    recurrentLine: {
      width: '1',
      color: 'red',
      className: 'test-recurrence',
    },
    inputs: {
      color: 'rgba(0, 128, 0, 0.5)',
      labels: null,
      className: 'test-input',
    },
    hidden: {
      color: 'rgba(255, 127, 80, 0.5)',
      className: 'test-hidden-neuron',
    },
    outputs: {
      color: 'rgba(100, 149, 237, 0.5)',
      className: 'test-output',
    },
    fontSize: '11px',
    fontClassName: 'test-label',
  };

  describe('`NeuralNetwork` input', () => {
    it('should throw if net is invalid', () => {
      expect(() => {
        const empty = {};
        toSVG(empty, options);
      }).toThrow();
    });
    it('should return valid xml', () => {
      const net = new NeuralNetwork({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
      });
      expect(parser.validate(toSVG(net, options))).toBe(true);
    });
    it('should have proper numbers of neurons', () => {
      const net = new NeuralNetwork({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
      });
      const svg = toSVG(net, options);
      const json = parser.parse(svg, {
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      expect(json.svg.rect.length).toBe(2);
      for (let i = 0; i < 2; i++) {
        expect(json.svg.rect[i].class).toBe('test-input');
      }
      expect(json.svg.rect[1].class).toBe('test-input');
      expect(json.svg.line.length).toBe(12);
      for (let i = 0; i < 12; i++) {
        expect(json.svg.line[i].class).toBe('test-connection');
      }
      expect(json.svg.circle.length).toBe(4);
      // hidden neurons first
      for (let i = 0; i < 3; i++) {
        expect(json.svg.circle[i].class).toBe('test-hidden-neuron');
      }
      expect(json.svg.circle[3].class).toBe('test-output');
    });
    it('throws if inputs.labels are defined as array, but do not match the input count', () => {
      const net = new NeuralNetwork({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
      });
      expect(() => {
        toSVG(net, {
          ...options,
          inputs: {
            ...options.inputs,
            labels: ['first'],
          },
        });
      }).toThrow();
    });
    it('can have labels', () => {
      const net = new NeuralNetwork({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
      });
      const svg = toSVG(net, {
        ...options,
        inputs: {
          ...options.inputs,
          labels: ['first', 'second'],
        },
      });
      const json = parser.parse(svg, {
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      expect(json.svg.text.length).toBe(2);
      expect(json.svg.text[0].class).toBe('test-label');
      expect(json.svg.text[0]['#text']).toBe('first');
      expect(json.svg.text[1].class).toBe('test-label');
      expect(json.svg.text[1]['#text']).toBe('second');
    });
  });

  describe('`json` NeuralNetwork input', () => {
    it('should throw when empty net object provided', () => {
      const empty = {};
      expect(() => {
        toSVG(empty, options);
      }).toThrow();
    });
    it('should return valid xml', () => {
      const net = {
        inputSize: 4,
        hiddenLayers: [3],
        outputSize: 2,
      };
      expect(parser.validate(toSVG(net, options))).toBe(true);
    });
  });

  describe('`RNN` input', () => {
    it('should throw when empty net object provided', () => {
      const empty = new RNN();
      empty.inputSize = null;
      empty.hiddenLayers = [];
      empty.outputSize = null;
      expect(() => {
        toSVG(empty, options);
      }).toThrow();
    });
    it('should return valid xml', () => {
      const net = new RNN({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
      });
      expect(parser.validate(toSVG(net, options))).toBe(true);
    });
  });

  describe('`RNN` json input', () => {
    it('should return valid xml', () => {
      const net = new RNN({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
      });
      net.initialize();
      expect(parser.validate(toSVG(net.toJSON(), options))).toBe(true);
    });
  });

  describe('`RNNTimeStep` input', () => {
    it('should throw when empty net object provided', () => {
      const empty = new RNNTimeStep();
      empty.inputSize = null;
      empty.hiddenLayers = [];
      empty.outputSize = null;
      expect(() => {
        toSVG(empty, options);
      }).toThrow();
    });
    it('should return valid xml', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
      });
      expect(parser.validate(toSVG(net, options))).toBe(true);
    });
  });

  describe('`RNNTimeStep` json input', () => {
    it('should return valid xml', () => {
      const net = new RNNTimeStep({
        inputSize: 2,
        hiddenLayers: [3],
        outputSize: 1,
      });
      net.initialize();
      expect(parser.validate(toSVG(net.toJSON(), options))).toBe(true);
    });
  });

  describe('`FeedForward` input', () => {
    it('should throw when empty net object provided', () => {
      const empty = new FeedForward();
      expect(() => {
        toSVG(empty, options);
      }).toThrow();
    });
    it('should return valid xml', () => {
      const net = new FeedForward({
        inputLayer: () => input({ height: 2 }),
        hiddenLayers: [
          (inputLayer) => feedForward({ height: 3 }, inputLayer),
          (inputLayer) => feedForward({ height: 1 }, inputLayer),
        ],
        outputLayer: (inputLayer) => target({ height: 1 }, inputLayer),
      });
      expect(parser.validate(toSVG(net, options))).toBe(true);
    });
  });

  describe('`Recurrent` input', () => {
    it('should throw when empty net object provided', () => {
      const empty = new Recurrent();
      expect(() => {
        toSVG(empty, options);
      }).toThrow();
    });
    it('should return valid xml', () => {
      const net = new Recurrent({
        inputLayer: () => input({ height: 2 }),
        hiddenLayers: [
          (inputLayer) => feedForward({ height: 3 }, inputLayer),
          (inputLayer) => feedForward({ height: 1 }, inputLayer),
        ],
        outputLayer: (inputLayer) => target({ height: 1 }, inputLayer),
      });
      expect(parser.validate(toSVG(net, options))).toBe(true);
    });
  });

  describe('just using sizes', () => {
    it('should throw when empty net object provided', () => {
      const empty = { sizes: null };
      expect(() => {
        toSVG(empty, options);
      }).toThrow();
    });
    it('should return valid xml', () => {
      const net = { sizes: [2, 3, 1] };
      expect(parser.validate(toSVG(net, options))).toBe(true);
    });
  });
});
