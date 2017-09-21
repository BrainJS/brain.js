'use strict';
import assert from 'assert';
import FeedForward from '../../src/feed-forward';
import { Base, input, Input, output, Output, convolution, Convolution, relu, Relu, pool, Pool, softMax, SoftMax } from '../../src/layer';

describe('FeedForward Neural Network', () => {
  describe('instantiation', () => {
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
      ])
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
});