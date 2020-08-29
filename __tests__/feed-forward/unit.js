const { GPU } = require('gpu.js');
const { setup, teardown } = require('../../src/utilities/kernel');
const { FeedForward } = require('../../src');
const {
  Add,
  Base,
  Convolution,
  convolution,
  feedForward,
  Input,
  input,
  Multiply,
  // Output,
  output,
  Pool,
  pool,
  Random,
  Relu,
  relu,
  Sigmoid,
  SoftMax,
  softMax,
  Target,
  // Zeros,
  types,
} = require('../../src/layer');
const { injectIstanbulCoverage } = require('../test-utils');

describe('FeedForward Class: Unit', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
        onIstanbulCoverageVariable: injectIstanbulCoverage,
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  describe('.constructor()', () => {
    test('initially does not have any layers', () => {
      expect(new FeedForward().layers).toBeNull();
    });
  });

  describe('layer composition', () => {
    const addValidate = Add.prototype.validate;
    beforeEach(() => {
      Add.prototype.validate = () => {};
    });
    afterEach(() => {
      Add.prototype.validate = addValidate;
    });
    describe('flat', () => {
      test('can setup and traverse entire network as needed', () => {
        const net = new FeedForward({
          inputLayer: () => input(),
          hiddenLayers: [
            (inputLayer) =>
              convolution(
                {
                  filterCount: 8,
                  filterWidth: 5,
                  filterHeight: 5,
                  padding: 2,
                  stride: 1,
                },
                inputLayer
              ),
            (inputLayer) => relu(inputLayer),
            (inputLayer) =>
              pool(
                {
                  filterHeight: 3,
                  filterWidth: 3,
                  padding: 2,
                  stride: 2,
                },
                inputLayer
              ),
            (inputLayer) =>
              convolution(
                {
                  padding: 2,
                  stride: 1,
                  filterCount: 16,
                  filterWidth: 5,
                  filterHeight: 5,
                },
                inputLayer
              ),
            (inputLayer) => relu(inputLayer),
            (inputLayer) =>
              pool(
                {
                  padding: 2,
                  filterWidth: 3,
                  filterHeight: 3,
                  stride: 3,
                },
                inputLayer
              ),
            (inputLayer) => softMax(inputLayer),
          ],
          outputLayer: (inputLayer) => output({ height: 10 }, inputLayer),
        });

        net.initialize();

        expect(net.layers.length).toBe(13);
        expect(net.layers.map((l) => l.constructor)).toEqual([
          Input,
          Convolution,
          Relu,
          Pool,
          Convolution,
          Relu,
          Pool,
          SoftMax,
          Random,
          Multiply,
          Random,
          Add,
          Target,
        ]);
      });

      test('can setup and traverse entire network using layer composed of layers', () => {
        const net = new FeedForward({
          inputLayer: () => input({ height: 1 }),
          hiddenLayers: [
            (inputLayer) => feedForward({ height: 1 }, inputLayer),
          ],
          outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
        });

        net.initialize();

        expect(net.layers.length).toBe(11);
        expect(net.layers.map((l) => l.constructor)).toEqual([
          Input,
          Random,
          Multiply,
          Random,
          Add,
          Sigmoid,
          Random,
          Multiply,
          Random,
          Add,
          Target,
        ]);
      });
    });

    describe('functional', () => {
      test('can setup and traverse entire network as needed', () => {
        const net = new FeedForward({
          inputLayer: () => input(),
          hiddenLayers: [
            (inputParam) =>
              softMax(
                pool(
                  {
                    filterWidth: 3, // TODO: setting height, width should behave same
                    filterHeight: 3,
                    padding: 2,
                    stride: 3,
                  },
                  relu(
                    convolution(
                      {
                        padding: 2,
                        stride: 1,
                        filterCount: 16,
                        filterWidth: 5,
                        filterHeight: 5,
                      },
                      pool(
                        {
                          filterWidth: 3,
                          filterHeight: 3,
                          padding: 2,
                          stride: 2,
                        },
                        relu(
                          convolution(
                            {
                              filterCount: 8,
                              filterWidth: 5,
                              filterHeight: 5,
                              padding: 2,
                              stride: 1,
                            },
                            inputParam
                          )
                        )
                      )
                    )
                  )
                )
              ),
          ],
          outputLayer: (inputParam) => output({ height: 10 }, inputParam),
        });
        net.initialize();

        expect(net.layers.length).toBe(13);
        expect(net.layers.map((l) => l.constructor)).toEqual([
          Input,
          Convolution,
          Relu,
          Pool,
          Convolution,
          Relu,
          Pool,
          SoftMax,
          Random,
          Multiply,
          Random,
          Add,
          Target,
        ]);
      });
    });
  });

  describe('.initialize()', () => {
    test('initializes all layers', () => {
      class TestLayer extends Base {
        setupKernels() {
          this.called = true;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer(),
          () => new TestLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer(),
      });
      net.initialize();

      expect(net.layers.length).toBe(5);
      expect(net.layers.map((l) => l.constructor !== undefined)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
    });

    test('populates praxis on all layers when it is null', () => {
      class TestLayer extends types.Model {
        setupKernels() {
          this.called = true;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer(),
          () => new TestLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer(),
      });
      net.initialize();

      expect(net.layers.length).toBe(5);
      expect(net.layers.map((l) => l.called)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(net.layers.map((l) => Boolean(l.praxis))).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
    });
    test('populates praxis when defined as setting on layer', () => {
      class TestLayer extends Base {
        setupKernels() {
          this.called = true;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer({ praxis: () => true }),
          () => new TestLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer(),
      });
      net.initialize();

      expect(net.layers.length).toBe(5);
      expect(net.layers.map((l) => l.called)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(net.layers.map((l) => l.praxis === true)).toEqual([
        false,
        true,
        false,
        false,
        false,
      ]);
    });
  });

  describe('.runInput()', () => {
    test('calls .predict() on all layers', () => {
      class TestLayer extends Base {
        // eslint-disable-next-line
        setupKernels() {}

        predict() {
          this.called = true;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer(),
          () => new TestLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer(),
      });

      net.initialize();
      net.runInput();

      expect(net.layers.map((l) => l.called)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
    });
  });

  describe('._calculateDeltas()', () => {
    test('calls .compare() on all layers', () => {
      class TestLayer extends Base {
        // eslint-disable-next-line
        setupKernels() {}

        // eslint-disable-next-line
        predict() {}

        compare() {
          this.called = true;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer(),
          () => new TestLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer(),
      });

      net.initialize();
      net._calculateDeltas();

      expect(net.layers.map((l) => l.called)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
    });
  });

  describe('.adjustWeights()', () => {
    test('calls .learn() on all layers', () => {
      class TestLayer extends types.Model {
        // eslint-disable-next-line
        setupKernels() {}

        // eslint-disable-next-line
        predict() {}

        // eslint-disable-next-line
        compare() {}

        learn() {
          this.called = true;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer(),
          () => new TestLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer(),
      });

      net.initialize();
      net.adjustWeights();

      expect(net.layers.map((l) => l.called)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
    });
  });

  describe('.toJSON()', () => {
    test('can serialize to json', () => {
      class TestInputLayer extends Base {
        constructor(settings) {
          super(settings);
          this.weights = [0, 1, 3, 4, 5, 6, 7, 8, 9];
        }
      }
      class TestLayer1 extends Base {
        static get defaults() {
          return { foo: null };
        }

        constructor(settings, inputLayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      class TestLayer2 extends Base {
        constructor(settings, inputLayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      class TestOperatorLayer extends Base {
        constructor(settings, inputLayer1, inputLayer2) {
          super(settings);
          this.inputLayer1 = inputLayer1;
          this.inputLayer2 = inputLayer2;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      class TestOutputLayer extends Base {
        constructor(settings, inputLayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestInputLayer({ width: 10, height: 1 }),
        hiddenLayers: [
          (inputParam) =>
            new TestOperatorLayer(
              { foo: true },
              new TestLayer1({ foo: true }, inputParam),
              new TestLayer2({}, inputParam)
            ),
        ],
        outputLayer: (inputParam) =>
          new TestOutputLayer({ width: 10, height: 5 }, inputParam),
      });
      net.initialize();

      const json = net.toJSON();

      expect(json.layers).toBeDefined();
      expect(json.layers.every((l) => !l.hasOwnProperty('deltas'))).toBe(true);
      expect(json.layers.length).toBe(5);
      expect(json.layers[0]).toEqual({
        type: 'TestInputLayer',
        praxisOpts: null,
        weights: [0, 1, 3, 4, 5, 6, 7, 8, 9],
        width: 10,
        height: 1,
        depth: null,
      });
      expect(json.layers[1]).toEqual({
        type: 'TestLayer1',
        praxisOpts: null,
        weights: null,
        inputLayerIndex: 0,
        foo: true,
        width: 1,
        height: 1,
        depth: null,
      });
      expect(json.layers[2]).toEqual({
        type: 'TestLayer2',
        praxisOpts: null,
        weights: null,
        inputLayerIndex: 0,
        width: 1,
        height: 1,
        depth: null,
      });
      expect(json.layers[3]).toEqual({
        type: 'TestOperatorLayer',
        praxisOpts: null,
        weights: null,
        inputLayer1Index: 1,
        inputLayer2Index: 2,
        width: 1,
        height: 1,
        depth: null,
      });
      expect(json.layers[4]).toEqual({
        height: 5,
        inputLayerIndex: 3,
        type: 'TestOutputLayer',
        weights: null,
        praxisOpts: null,
        width: 10,
        depth: null,
      });
    });
  });

  describe('.fromJSON()', () => {
    test('can deserialize to object from json using inputLayerIndex', () => {
      class TestLayer extends Base {
        static get defaults() {
          return { foo: null };
        }

        constructor(settings, inputLayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      const net = FeedForward.fromJSON(
        {
          layers: [
            {
              type: 'TestLayer',
              foo: true,
            },
            {
              type: 'TestLayer',
              foo: true,
              inputLayerIndex: 0,
            },
            {
              type: 'TestLayer',
              foo: true,
              inputLayerIndex: 1,
            },
            {
              type: 'TestLayer',
              foo: true,
              inputLayerIndex: 2,
            },
          ],
        },
        (jsonLayer, inputParam) => {
          switch (jsonLayer.type) {
            case 'TestLayer':
              return new TestLayer(jsonLayer, inputParam);
            default:
              throw new Error(`unknown layer ${jsonLayer.type}`);
          }
        }
      );

      expect(net.layers.map((l) => l instanceof TestLayer)).toEqual([
        true,
        true,
        true,
        true,
      ]);
      expect(net.layers.map((l) => l.inputLayer instanceof TestLayer)).toEqual([
        false,
        true,
        true,
        true,
      ]);
    });

    test('can deserialize to object from json using inputLayer1Index & inputLayer2Index', () => {
      class TestLayer extends Base {
        static get defaults() {
          return { foo: null };
        }

        constructor(settings, inputLayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      class TestOperatorLayer extends Base {
        static get defaults() {
          return { foo: null };
        }

        constructor(settings, inputLayer1, inputLayer2) {
          super(settings);
          this.inputLayer1 = inputLayer1;
          this.inputLayer2 = inputLayer2;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      const net = FeedForward.fromJSON(
        {
          layers: [
            {
              type: 'TestLayer',
              foo: true,
            },
            {
              type: 'TestLayer',
              foo: true,
              inputLayerIndex: 0,
            },
            {
              type: 'TestOperatorLayer',
              foo: true,
              inputLayer1Index: 0,
              inputLayer2Index: 1,
            },
          ],
        },
        (jsonLayer, input1, input2) => {
          switch (jsonLayer.type) {
            case 'TestLayer':
              return new TestLayer(jsonLayer, input1);
            case 'TestOperatorLayer':
              return new TestOperatorLayer(jsonLayer, input1, input2);
            default:
              throw new Error(`unknown layer ${jsonLayer.type}`);
          }
        }
      );

      expect(net.layers.length).toBe(3);
      expect(net.layers[0] instanceof TestLayer).toBeTruthy();
      expect(net.layers[0] instanceof TestLayer).toBeTruthy();
      expect(net.layers[1] instanceof TestLayer).toBeTruthy();
      expect(net.layers[2] instanceof TestOperatorLayer).toBeTruthy();
      expect(net.layers[2].inputLayer1).toEqual(net.layers[0]);
      expect(net.layers[2].inputLayer2).toEqual(net.layers[1]);
    });
  });

  describe('._trainPattern()', () => {
    test('calls training methods and mse2d and returns value', () => {
      const net = new FeedForward({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [(inputLayer) => feedForward({ height: 1 }, inputLayer)],
        outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
      });
      net.initialize();
      net._outputLayer = { errors: [0] };

      const runInput = jest.spyOn(net, 'runInput');
      const _calculateDeltas = jest.spyOn(net, '_calculateDeltas');
      const adjustWeights = jest.spyOn(net, 'adjustWeights');

      net._trainPattern([1], [3], true);

      expect(runInput).toHaveBeenCalled();
      expect(_calculateDeltas).toHaveBeenCalled();
      expect(adjustWeights).toHaveBeenCalled();
    });
  });
  describe('.trainOpts', () => {
    test('.errorCheckInterval', () => {
      const mockInstance = {
        trainOpts: {
          iterations: 2,
          errorCheckInterval: 1,
          errorThresh: 1,
        },
        _calculateTrainingError: jest.fn(),
      };
      const mockData = [];
      const mockStatus = {
        iterations: 0,
        error: 5,
      };
      const mockEndTime = Date.now() + 1000000;
      FeedForward.prototype._trainingTick.apply(mockInstance, [
        mockData,
        mockStatus,
        mockEndTime,
      ]);
      expect(mockInstance._calculateTrainingError).toHaveBeenCalled();
    });
  });
});
