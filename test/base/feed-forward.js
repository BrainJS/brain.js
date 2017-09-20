'use strict';
import assert from 'assert';
import FeedForward from '../../src/feed-forward';
import { input, output, convolution, relu, pool, softMax } from '../../src/layer';

describe('FeedForward Neural Network', () => {
  describe('instantiation', () => {
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
          outputLayer: () => output({ width: 10 })
        });

        assert.equal(net.layers.length, 9);
      });
    });
    describe('functional hiddenLayer option', () => {
      const net = new FeedForward({
        inputLayer: () => input(),
        hiddenLayers: [
          (input) => softMax({ width: 10 },
            pool({ width: 3, stride: 3 },
              relu(
                convolution({ padding: 2, stride: 1, filterCount: 16, filterWidth: 5, filterHeight: 5 },
                  pool({ padding: 2, stride: 2 },
                    relu(
                      convolution({ filterCount: 8, filterWidth: 5, filterHeight: 5, padding: 2, stride: 1 }, input)
                    )
                  )
                )
              )
            )
          )
        ],
        outputLayer: () => output({ width: 10 })
      });
      assert.equal(net.layers.length, 9);
    });
  });
});