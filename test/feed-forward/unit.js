import assert from 'assert';
import sinon from 'sinon';
import { FeedForward, layer } from '../../src';

const {
  Add,
  Base,
  Convolution,
  convolution,
  feedForward,
  Input,
  input,
  Multiply,
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
  Target
} = layer;

describe('FeedForward Class: Unit', () => {
  describe('.constructor()', () => {
    it('initially does not have any layers', () => {
      assert.equal(new FeedForward().layers, null);
    });
  });
  describe('layer composition', () => {
    describe('flat', () => {
      it('can setup and traverse entire network as needed', () => {
        const net = new FeedForward({
          inputLayer: () => input(),
          hiddenLayers: [
            (input) => convolution({filterCount: 8, filterWidth: 5, filterHeight: 5, padding: 2, stride: 1}, input),
            (input) => relu(input),
            (input) => pool({padding: 2, stride: 2}, input),
            (input) => convolution({padding: 2, stride: 1, filterCount: 16, filterWidth: 5, filterHeight: 5}, input),
            (input) => relu(input),
            (input) => pool({width: 3, stride: 3}, input),
            (input) => softMax({width: 10}, input)
          ],
          outputLayer: (input) => output({width: 10}, input)
        });
        net.initialize();
        assert.equal(net.layers.length, 11);
        assert.deepEqual(net.layers.map(layer => layer.constructor), [
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
          Target
        ]);
      });
      it('can setup and traverse entire network using layer composed of layers', () => {
        const net = new FeedForward({
          inputLayer: () => input(),
          hiddenLayers: [
            (input) => feedForward({ width: 1 }, input)
          ],
          outputLayer: (input) => output({ width: 1 }, input)
        });
        net.initialize();
        assert.equal(net.layers.length, 9);
        assert.deepEqual(net.layers.map(layer => layer.constructor), [
          Input,
          Random,
          Multiply,
          Random,
          Add,
          Sigmoid,
          Random,
          Multiply,
          Target
        ]);
      });
    });
    describe('functional', () => {
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
        net.initialize();
        assert.equal(net.layers.length, 11);
        assert.deepEqual(net.layers.map(layer => layer.constructor), [
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
          Target
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
      assert.deepEqual(net.layers.map(layer => Boolean(layer.praxis)), [
        true,
        true,
        true,
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

      const net = new FeedForward({
        inputLayer: () => new TestLayer(),
        hiddenLayers: [
          () => new TestLayer({ praxis: () => true }),
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
      class TestInputLayer extends Base {
        constructor(settings) {
          super(settings);
          this.weights = [0,1,3,4,5,6,7,8,9]
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
        setupKernels() {}
      }

      class TestLayer2 extends Base {
        constructor(settings, inputLayer) {
          super(settings);
          this.inputLayer = inputLayer;
        }
        setupKernels() {}
      }

      class TestOperatorLayer extends Base {
        constructor(settings, inputLayer1, inputLayer2) {
          super(settings);
          this.inputLayer1 = inputLayer1;
          this.inputLayer2 = inputLayer2;
        }
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
          (input) =>
            new TestOperatorLayer(
              {foo: true},
              new TestLayer1({foo: true}, input),
              new TestLayer2({}, input)
          ),
        ],
        outputLayer: (input) => new TestOutputLayer({ width: 10, height: 5 }, input)
      });
      net.initialize();

      const json = net.toJSON();
      assert(json.hasOwnProperty('layers'));
      assert(json.layers.every(layer => !layer.hasOwnProperty('deltas')), 'deltas are included and should not be');
      assert(json.layers.length === 5);
      assert.deepEqual(json.layers[0], {
        type: 'TestInputLayer',
        weights: [0,1,3,4,5,6,7,8,9],
        width: 10,
        height: 1
      }, 'input layer is not serialized correctly');
      assert.deepEqual(json.layers[1], {
        type: 'TestLayer1',
        weights: null,
        inputLayerIndex: 0,
        foo: true,
        width: 1,
        height: 1
      }, 'TestLayer1 did not serialized correctly');
      assert.deepEqual(json.layers[2], {
        type: 'TestLayer2',
        weights: null,
        inputLayerIndex: 0,
        width: 1,
        height: 1
      });
      assert.deepEqual(json.layers[3], {
        type: 'TestOperatorLayer',
        weights: null,
        inputLayer1Index: 1,
        inputLayer2Index: 2,
        width: 1,
        height: 1
      }, 'TestLayer2 did not serialized correctly');
      assert.deepEqual(json.layers[4], {
        height: 5,
        inputLayerIndex: 3,
        type: 'TestOutputLayer',
        weights: null,
        width: 10
      }, 'TestOutputLayer did not serialize correctly');
    });
  });
  describe('.fromJSON()', () => {
    it('can deserialize to object from json using inputLayerIndex', () => {
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
    it('can deserialize to object from json using inputLayer1Index & inputLayer2Index', () => {
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

      class TestOperatorLayer extends Base {
        static get defaults() {
          return { foo: null };
        }
        constructor(settings, inputLayer1, inputLayer2) {
          super(settings);
          this.inputLayer1 = inputLayer1;
          this.inputLayer2 = inputLayer2;
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
            type: 'TestOperatorLayer',
            foo: true,
            inputLayer1Index: 0,
            inputLayer2Index: 1
          }
        ]
      }, (jsonLayer, input1, input2) => {
        switch (jsonLayer.type) {
          case 'TestLayer':
            return new TestLayer(jsonLayer, input1);
          case 'TestOperatorLayer':
            return new TestOperatorLayer(jsonLayer, input1, input2);
          default:
            throw new Error(`unknown layer ${ jsonLayer.type }`);
        }
      });

      assert(net.layers.length === 3);
      assert(net.layers[0] instanceof TestLayer);
      assert(net.layers[1] instanceof TestLayer);
      assert(net.layers[2] instanceof TestOperatorLayer);
      assert(net.layers[2].inputLayer1 === net.layers[0]);
      assert(net.layers[2].inputLayer2 === net.layers[1]);
    });
  });
  describe('.trainPattern()', () => {
    it('calls training methods and mse2d and returns value', () => {
      const net = new FeedForward();
      net._outputLayer = { errors: [0] };
      net.runInput = sinon.spy();
      net.calculateDeltas = sinon.spy();
      net.adjustWeights = sinon.spy();
      net.trainPattern();
      assert(net.runInput.called);
      assert(net.calculateDeltas.called);
      assert(net.calculateDeltas.called);
    });
  });
});