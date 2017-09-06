'use strict';

import assert from 'assert';
import { predict, learnFilters, learnInputs } from '../../src/layer/convolution';

describe('Convolution Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can convolution a simple matrix', () => {
      const inputs = [[
        [1,2,3],
        [4,5,6],
        [7,8,9]
      ]];
      const filters = [[
        [1,2,3],
        [4,5,6],
        [7,8,9]
      ]];
      const biases = [1,2,3];
      const context = {
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1
        },
        output: {
          x: 3,
          y: 3,
          z: 1
        },
        thread: {
          x: 0,
          y: 0,
          z: 0
        }
      };
      const result = [];

      for (let y = 0; y < inputs[0].length; y++) {
        const row = [];
        for (let x = 0; x < inputs[0][y].length; x++) {
          context.thread.x = x;
          context.thread.y = y;
          const result = predict.call(context, filters, inputs, biases);
          row.push(result);
        }
        result.push(row);
      }

      assert.deepEqual(result, [
        [286,187,91],
        [155, 95, 43],
        [51, 27, 10]
      ]);
    });
  });

  describe('.learnFilters (back propagation)', () => {
    it('can convolution a simple matrix', () => {
      const inputs = [[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]];
      const deltas = [[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]];
      const context = {
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1
        },
        thread: {
          z: 0,
          x: 0,
          y: 0
        },
        output: {
          x: 3,
          y: 3
        }
      };
      const result = [];

      for (let y = 0; y < inputs[0].length; y++) {
        const row = [];
        for (let x = 0; x < inputs[0][y].length; x++) {
          context.thread.x = x;
          context.thread.y = y;
          const result = learnFilters.call(context, inputs, deltas);
          row.push(result);
        }
        result.push(row);
      }

      //TODO: likely incorrect
      assert.deepEqual(result, [
        [45, 33, 18],
        [39, 28, 15],
        [24, 17, 9]
      ]);
    });
  });

  describe('.learnInputs (back propagation)', () => {
    it('can convolution a simple matrix', () => {
      const input = [[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]];
      const delta = [[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]];
      const context = {
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1
        },
        thread: {
          x: 0,
          y: 0
        },
        output: {
          x: 3,
          y: 3
        }
      };
      const result = [];

      for (let y = 0; y < input[0].length; y++) {
        const row = [];
        for (let x = 0; x < input[0][y].length; x++) {
          context.thread.x = x;
          context.thread.y = y;
          const result = learnInputs.call(context, input, delta);
          row.push(result);
        }
        result.push(row);
      }

      assert.deepEqual(result, [
        [1,4,10],
        [8, 26, 56],
        [30, 84, 165]
      ]);
    });
  });
});