import assert from 'assert';
const {
  Add,
  Base,
  Convolution,
  convolution,
  feedForward,
  Input,
  input,
  OperatorBase,
  Output,
  output,
  Pool,
  pool,
  Random,
  Relu,
  relu,
  Sigmoid,
  SoftMax,
  softMax,
  Weigh
} = layer;
import { FeedForward, layer } from '../../src';

describe('FeedForward Class: Unit', () => {
  describe('.constructor()', () => {
    it('initially does not have any layers', () => {
      assert.equal(new FeedForward().layers, null);
    });
  });
  describe('.connectLayers()', () => {
    describe('flat hiddenLayer option', () => {
      it('can setup and traverse entire network as needed', () => {
        const net = new FeedForward({
          inputLayer: () => input(),
          hiddenLayers: [
            (input) => convolution({ filterCount: 8, filterWidth: 5, filterHeight: 5, padding: 2, stride: 1 }, input),
            (input) => relu(input),
            (input) => pool({ padding: 2, stride: 2 }, input),
            (input) => convolution({ padding: 2, stride: 1, filterCount: 16, filterWidth: 5, filterHeight: 5 }, input),
            (input) => relu(input),
            (input) => pool({ width: 3, stride: 3 }, input),
            (input) => softMax({ width: 10 }, input)
          ],
          outputLayer: (input) => output({ width: 10 }, input)
        });
        net.connectLayers();
        assert.equal(net.layers.length, 9);
        assert.deepEqual(net.layers.map(layer => layer.constructor), [
          Input,
          Convolution,
          Relu,
          Pool,
          Convolution,
          Relu,
          Pool,
          SoftMax,
          Output
        ]);
      });
      it('can setup and traverse entire network using layer composition', () => {
        const net = new FeedForward({
          inputLayer: () => input(),
          hiddenLayers: [
            (input) => feedForward({}, input)
          ],
          outputLayer: (input) => output({}, input)
        });
        net.connectLayers();
        assert.equal(net.layers.length, 7);
        assert.deepEqual(net.layers.map(layer => layer.constructor), [
          Input,
          Random,
          Weigh,
          Random,
          Add,
          Sigmoid,
          Output
        ]);
      });
    });
    describe('functional hiddenLayer option', () => {
      it('can setup and traverse entire network as needed', () => {
        const net = new FeedForward({
          inputLayer: () => input(),
          hiddenLayers: [
            (input) => softMax({width: 10},
              pool({width: 3, stride: 3},
                relu(
                  convolution({padding: 2, stride: 1, filterCount: 16, filterWidth: 5, filterHeight: 5},
                    pool({padding: 2, stride: 2},
                      relu(
                        convolution({filterCount: 8, filterWidth: 5, filterHeight: 5, padding: 2, stride: 1}, input)
                      )
                    )
                  )
                )
              )
            )
          ],
          outputLayer: (input) => output({width: 10}, input)
        });
        net.connectLayers();
        assert.equal(net.layers.length, 9);
        assert.deepEqual(net.layers.map(layer => layer.constructor), [
          Input,
          Convolution,
          Relu,
          Pool,
          Convolution,
          Relu,
          Pool,
          SoftMax,
          Output
        ]);
      });
    });
  });
  describe('.initialize()', () => {
    it('initializes all layers', () => {
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
        outputLayer: () => new TestLayer()
      });
      net.initialize();

      assert.equal(net.layers.length, 5);
      assert.deepEqual(net.layers.map(layer => layer.called), [
        true,
        true,
        true,
        true,
        true
      ]);
    });
    it('populates praxis on all layers when it is null', () => {
      class TestLayer extends Base {
        setupKernels() {
          this.called = true;
        }
      }
      class OperatorLayer extends OperatorBase {
        setupKernels() {
          this.called = true;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer(),
          () => new OperatorLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer()
      });
      net.initialize();

      assert.equal(net.layers.length, 5);
      assert.deepEqual(net.layers.map(layer => layer.called), [
        true,
        true,
        true,
        true,
        true
      ]);
      assert.deepEqual(net.layers.map(layer => Boolean(layer.praxis)), [
        true,
        true,
        false,
        true,
        true
      ]);
    });
    it('populates praxis when defined as setting on layer', () => {
      class TestLayer extends Base {
        setupKernels() {
          this.called = true;
        }
      }
      class OperatorLayer extends OperatorBase {
        setupKernels() {
          this.called = true;
        }
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer({ praxis: () => true }),
          () => new OperatorLayer(),
          () => new TestLayer(),
        ],
        outputLayer: () => new TestLayer()
      });
      net.initialize();

      assert.equal(net.layers.length, 5);
      assert.deepEqual(net.layers.map(layer => layer.called), [
        true,
        true,
        true,
        true,
        true
      ]);
      assert.deepEqual(net.layers.map(layer => layer.praxis === true), [
        false,
        true,
        false,
        false,
        false
      ]);
    });
  });
  describe('.runInput()', () => {
    it('calls .predict() on all layers', () => {
      class TestLayer extends Base {
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
          () => new TestLayer()
        ],
        outputLayer: () => new TestLayer()
      });

      net.initialize();
      net.runInput();
      assert.deepEqual(net.layers.map(layer => layer.called), [true, true, true, true, true]);
    });
  });
  describe('.calculateDeltas()', () => {
    it('calls .compare() on all layers', () => {
      class TestLayer extends Base {
        setupKernels() {}
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
          () => new TestLayer()
        ],
        outputLayer: () => new TestLayer()
      });

      net.initialize();
      net.calculateDeltas();
      assert.deepEqual(net.layers.map(layer => layer.called), [true, true, true, true, true]);
    });
  });
  describe('.adjustWeights()', () => {
    it('calls .learn() on all layers', () => {
      class TestLayer extends Base {
        setupKernels() {}
        predict() {}
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
          () => new TestLayer()
        ],
        outputLayer: () => new TestLayer()
      });

      net.initialize();
      net.adjustWeights();
      assert.deepEqual(net.layers.map(layer => layer.called), [true, true, true, true, true]);
    });
  });
  describe('.toJSON()', () => {
    it('can serialize to json', () => {
      class TestLayer extends Base {
        static get defaults() {
          return { foo: null };
        }
        constructor(settings, inputLayer) {
          super(settings);
          if (inputLayer !== undefined) {
            this.inputLayer = inputLayer;
          }
        }
        setupKernels() {}
      }

      const net = new FeedForward({
        inputLayer: () => new TestLayer({ foo: true }),
        hiddenLayers: [
          (input) => new TestLayer({ foo: true }, input),
          (input) => new TestLayer({ foo: true }, input),
        ],
        outputLayer: (input) => new TestLayer({ foo: true }, input)
      });
      net.initialize();

      assert.deepEqual(net.toJSON(), {
        layers: [
          {
            type: 'TestLayer',
            foo: true
          },
          {
            type: 'TestLayer',
            foo: true,
            inputLayerIndex: 0
          },
          {
            type: 'TestLayer',
            foo: true,
            inputLayerIndex: 1
          },
          {
            type: 'TestLayer',
            foo: true,
            inputLayerIndex: 2
          }
        ]
      });
    });
  });
  describe('.fromJSON()', () => {
    it('can deserialize to object from json', () => {
      class TestLayer extends Base {
        static get defaults() {
          return { foo: null };
        }
        constructor(settings, inputLayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }
        setupKernels() {}
      }

      const net = FeedForward.fromJSON({
        layers: [
          {
            type: 'TestLayer',
            foo: true
          },
          {
            type: 'TestLayer',
            foo: true,
            inputLayerIndex: 0
          },
          {
            type: 'TestLayer',
            foo: true,
            inputLayerIndex: 1
          },
          {
            type: 'TestLayer',
            foo: true,
            inputLayerIndex: 2
          }
        ]
      }, (jsonLayer, input) => {
        switch (jsonLayer.type) {
          case 'TestLayer':
            return new TestLayer(jsonLayer, input);
          default:
            throw new Error(`unknown layer ${ jsonLayer.type }`);
        }
      });

      assert.deepEqual(net.layers.map(layer => layer instanceof TestLayer), [true, true, true, true]);
      assert.deepEqual(net.layers.map(layer => layer.inputLayer instanceof TestLayer), [false, true, true, true]);
    });
  });
});