import { GPU } from 'gpu.js';
import { setup, teardown } from '../../src/utilities/kernel';
import { FeedForward } from '../../src/feed-forward';
import {
  Add,
  BaseLayer,
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
  layerTypes,
  ILayer,
  ILayerJSON,
  ILayerSettings,
} from '../../src/layer';
import { mockLayer, mockPraxis } from '../test-utils';
import SpyInstance = jest.SpyInstance;

describe('FeedForward Class: Unit', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
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
          inputLayer: () => input({ width: 1 }),
          hiddenLayers: [
            (inputLayer: ILayer) =>
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
            (inputLayer: ILayer) => relu(inputLayer),
            (inputLayer: ILayer) =>
              pool(
                {
                  filterHeight: 3,
                  filterWidth: 3,
                  padding: 2,
                  stride: 2,
                },
                inputLayer
              ),
            (inputLayer: ILayer) =>
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
            (inputLayer: ILayer) => relu(inputLayer),
            (inputLayer: ILayer) =>
              pool(
                {
                  padding: 2,
                  filterWidth: 3,
                  filterHeight: 3,
                  stride: 3,
                },
                inputLayer
              ),
            (inputLayer: ILayer) => softMax(inputLayer),
          ],
          outputLayer: (inputLayer: ILayer) =>
            output({ height: 10 }, inputLayer),
        });

        net.initialize();

        const layers = net.layers as ILayer[];
        expect(layers.length).toBe(13);
        expect(layers.map((l: ILayer) => l.constructor)).toEqual([
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

        const layers = net.layers as ILayer[];
        expect(layers.length).toBe(11);
        expect(layers.map((l) => l.constructor)).toEqual([
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
          inputLayer: () => input({ width: 1 }),
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

        const layers = net.layers as ILayer[];
        expect(layers.length).toBe(13);
        expect(layers.map((l) => l.constructor)).toEqual([
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
      class TestLayer extends BaseLayer {
        called?: boolean;
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

      const layers = net.layers as ILayer[];
      expect(layers.length).toBe(5);
      expect(layers.map((l) => l.constructor !== undefined)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
    });

    test('populates praxis on all layers when it is null', () => {
      class TestLayer extends layerTypes.Model {
        called?: boolean;
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

      const layers = net.layers as ILayer[];
      expect(layers.length).toBe(5);
      expect(layers.map((l) => (l as TestLayer).called)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(layers.map((l) => Boolean(l.praxis))).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
    });
    test('populates praxis when defined as setting on layer', () => {
      class TestLayer extends BaseLayer {
        called?: boolean;
        setupKernels() {
          this.called = true;
        }
      }

      const praxis = mockPraxis(mockLayer({}));
      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          (l: ILayer) => new TestLayer({ initPraxis: () => praxis }),
          () => new TestLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer(),
      });
      net.initialize();

      const layers = net.layers as ILayer[];
      expect(layers.length).toBe(5);
      expect(layers.map((l) => (l as TestLayer).called)).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(layers.map((l) => l.praxis === praxis)).toEqual([
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
      class TestLayer extends BaseLayer {
        // eslint-disable-next-line
        setupKernels() {}

        called?: boolean;
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

      const layers = net.layers as ILayer[];
      expect(layers.map((l) => (l as TestLayer).called)).toEqual([
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
      class TestLayer extends BaseLayer {
        // eslint-disable-next-line
        setupKernels() {}

        // eslint-disable-next-line
        predict() {}

        called?: boolean;
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

      const layers = net.layers as ILayer[];
      expect(layers.map((l) => (l as TestLayer).called)).toEqual([
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
      class TestLayer extends layerTypes.Model {
        // eslint-disable-next-line
        setupKernels() {}

        // eslint-disable-next-line
        predict() {}

        // eslint-disable-next-line
        compare() {}

        called?: boolean;
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

      const layers = net.layers as ILayer[];
      expect(layers.map((l) => (l as TestLayer).called)).toEqual([
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
      class TestInputLayer extends BaseLayer {
        constructor(settings: ILayerSettings) {
          super(settings);
          this.weights = new Float32Array([0, 1, 3, 4, 5, 6, 7, 8, 9]);
        }
      }
      class TestLayer1 extends BaseLayer {
        inputLayer: ILayer;
        constructor(settings: ILayerSettings, inputLayer: ILayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      class TestLayer2 extends BaseLayer {
        inputLayer: ILayer;
        constructor(settings: ILayerSettings, inputLayer: ILayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      class TestOperatorLayer extends BaseLayer {
        inputLayer1: ILayer;
        inputLayer2: ILayer;
        constructor(inputLayer1: ILayer, inputLayer2: ILayer) {
          super();
          this.inputLayer1 = inputLayer1;
          this.inputLayer2 = inputLayer2;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      class TestOutputLayer extends BaseLayer {
        inputLayer: ILayer;
        constructor(settings: ILayerSettings, inputLayer: ILayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestInputLayer({ width: 10, height: 1 }),
        hiddenLayers: [
          (inputParam) =>
            new TestOperatorLayer(
              new TestLayer1({}, inputParam),
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
        depth: 0,
      });
      expect(json.layers[1]).toEqual({
        type: 'TestLayer1',
        praxisOpts: null,
        weights: null,
        inputLayerIndex: 0,
        width: 1,
        height: 1,
        depth: 0,
      });
      expect(json.layers[2]).toEqual({
        type: 'TestLayer2',
        praxisOpts: null,
        weights: null,
        inputLayerIndex: 0,
        width: 1,
        height: 1,
        depth: 0,
      });
      expect(json.layers[3]).toEqual({
        type: 'TestOperatorLayer',
        praxisOpts: null,
        weights: null,
        inputLayer1Index: 1,
        inputLayer2Index: 2,
        width: 1,
        height: 1,
        depth: 0,
      });
      expect(json.layers[4]).toEqual({
        height: 5,
        inputLayerIndex: 3,
        type: 'TestOutputLayer',
        weights: null,
        praxisOpts: null,
        width: 10,
        depth: 0,
      });
    });
  });

  describe('.fromJSON()', () => {
    test('can deserialize to object from json using inputLayerIndex', () => {
      class TestLayer extends BaseLayer implements ILayer {
        inputLayer?: ILayer;
        constructor(settings: ILayerSettings, inputLayer?: ILayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      const net = FeedForward.fromJSON(
        {
          type: '',
          sizes: [],
          inputLayerIndex: 0,
          outputLayerIndex: 3,
          layers: [
            {
              type: 'TestLayer',
            },
            {
              type: 'TestLayer',
              inputLayerIndex: 0,
            },
            {
              type: 'TestLayer',
              inputLayerIndex: 1,
            },
            {
              type: 'TestLayer',
              inputLayerIndex: 2,
            },
          ],
        },
        (jsonLayer: ILayerJSON, inputLayer1?: ILayer, inputLayer2?: ILayer) => {
          switch (jsonLayer.type) {
            case 'TestLayer':
              return new TestLayer(jsonLayer, inputLayer1);
            default:
              throw new Error(`unknown layer ${jsonLayer.type}`);
          }
        }
      );

      const layers = net.options.layers as ILayer[];
      expect(layers.map((l) => l instanceof TestLayer)).toEqual([
        true,
        true,
        true,
        true,
      ]);
      expect(layers.map((l) => l.inputLayer instanceof TestLayer)).toEqual([
        false,
        true,
        true,
        true,
      ]);
    });

    test('can deserialize to object from json using inputLayer1Index & inputLayer2Index', () => {
      class TestLayer extends BaseLayer {
        static get defaults() {
          return { foo: null };
        }

        inputLayer?: ILayer;
        constructor(settings: ILayerSettings, inputLayer?: ILayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      class TestOperatorLayer extends BaseLayer {
        static get defaults() {
          return { foo: null };
        }

        inputLayer1?: ILayer;
        inputLayer2?: ILayer;
        constructor(
          settings: ILayerSettings,
          inputLayer1?: ILayer,
          inputLayer2?: ILayer
        ) {
          super(settings);
          this.inputLayer1 = inputLayer1;
          this.inputLayer2 = inputLayer2;
        }

        // eslint-disable-next-line
        setupKernels() {}
      }

      const net = FeedForward.fromJSON(
        {
          sizes: [],
          type: '',
          inputLayerIndex: 0,
          outputLayerIndex: 2,
          layers: [
            {
              type: 'TestLayer',
            },
            {
              type: 'TestLayer',
              inputLayerIndex: 0,
            },
            {
              type: 'TestOperatorLayer',
              inputLayer1Index: 0,
              inputLayer2Index: 1,
            },
          ],
        },
        (jsonLayer: ILayerJSON, inputLayer1?: ILayer, inputLayer2?: ILayer) => {
          switch (jsonLayer.type) {
            case 'TestLayer':
              return new TestLayer(jsonLayer, inputLayer1);
            case 'TestOperatorLayer':
              return new TestOperatorLayer(jsonLayer, inputLayer1, inputLayer2);
            default:
              throw new Error(`unknown layer ${jsonLayer.type}`);
          }
        }
      );

      const layers = net.options.layers as ILayer[];
      expect(layers.length).toBe(3);
      expect(layers[0] instanceof TestLayer).toBeTruthy();
      expect(layers[0] instanceof TestLayer).toBeTruthy();
      expect(layers[1] instanceof TestLayer).toBeTruthy();
      expect(layers[2] instanceof TestOperatorLayer).toBeTruthy();
      expect(layers[2].inputLayer1).toEqual(layers[0]);
      expect(layers[2].inputLayer2).toEqual(layers[1]);
    });
  });

  describe('._trainPattern()', () => {
    let runInputSpy: jest.SpyInstance;
    let _calculateDeltasSpy: jest.SpyInstance;
    let adjustWeightsSpy: jest.SpyInstance;
    beforeEach(() => {
      runInputSpy = jest.spyOn(FeedForward.prototype, 'runInput');
      _calculateDeltasSpy = jest.spyOn(
        FeedForward.prototype,
        '_calculateDeltas'
      );
      adjustWeightsSpy = jest.spyOn(FeedForward.prototype, 'adjustWeights');
    });
    afterEach(() => {
      runInputSpy.mockRestore();
      _calculateDeltasSpy.mockRestore();
      adjustWeightsSpy.mockRestore();
    });
    test('calls training methods and mse2d and returns value', () => {
      const net = new FeedForward({
        inputLayer: () => input({ height: 1 }),
        hiddenLayers: [(inputLayer) => feedForward({ height: 1 }, inputLayer)],
        outputLayer: (inputLayer) => output({ height: 1 }, inputLayer),
      });
      net.initialize();
      net._outputLayer = mockLayer({});
      net._outputLayer.errors = [0];

      net._trainPattern([1], [3], true);

      expect(runInputSpy).toHaveBeenCalled();
      expect(_calculateDeltasSpy).toHaveBeenCalled();
      expect(adjustWeightsSpy).toHaveBeenCalled();
    });
  });
  describe('.trainOpts', () => {
    let net: FeedForward;
    let _calculateTrainingErrorSpy: SpyInstance;
    beforeEach(() => {
      const layer1 = mockLayer({ width: 1, height: 1 });
      const layer2 = mockLayer({ width: 1, height: 1 });
      layer2.errors = [1];
      net = new FeedForward({
        inputLayerIndex: 0,
        layers: [layer1, layer2],
        outputLayerIndex: 1,
      });
      _calculateTrainingErrorSpy = jest.spyOn(net, '_calculateTrainingError');
    });
    afterEach(() => {
      _calculateTrainingErrorSpy.mockRestore();
    });
    test('.errorCheckInterval', () => {
      const trainOpts = {
        iterations: 2,
        errorCheckInterval: 1,
        errorThresh: 0.5,
      };
      const mockData = [{ input: [1, 1], output: [1] }];
      net.train(mockData, trainOpts);
      expect(_calculateTrainingErrorSpy).toHaveBeenCalled();
    });
  });
});
