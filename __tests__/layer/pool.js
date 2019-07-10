const gpuMock = require('gpu-mock.js');
const { Pool, predict, compare, compare3D } = require('../../src/layer/pool');

describe('Pool Layer', () => {
  describe('constructor', () => {
    test('correctly sets dimensions', () => {
      const layer = new Pool(
        {
          filterWidth: 2,
          filterHeight: 2,
          filterCount: 8,
          stride: 2,
        },
        {
          width: 24,
          height: 24,
        }
      );
      expect(layer.width).toEqual(12);
      expect(layer.height).toEqual(12);
      expect(layer.depth).toEqual(8);
    });
  });
  describe('.predict (forward propagation)', () => {
    test('can pool a simple matrix', () => {
      const inputs = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]];
      const results = gpuMock(predict, {
        output: [1, 1, 0],
        constants: {
          strideX: 1,
          strideY: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1,
          paddingX: 0,
          paddingY: 0,
          filterWidth: 3,
          filterHeight: 3,
          filterCount: 1,
        },
      })(inputs);

      expect(results).toEqual([[9]]);
    });
  });
  describe('.compare (back propagation)', () => {
    test('can pool a simple matrix', () => {
      const deltas = [[1,2],[3,4]];
      const switchX = [[1,0], [1,0]];
      const switchY = [[1,1],[0,0]];
      const results = gpuMock(compare, {
        output: [2, 2],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
          outputWidth: 2,
          outputHeight: 2,
        },
      })(deltas, switchY, switchX);

      expect(results).toEqual([[4,3], [2,1]]);
    });
    test('can pool a simple matrix', () => {
      const deltas = [[1,2],[3,4]];
      const switchX = [[1,1],[1,1]];
      const switchY = [[1,1],[1,1]];
      const results = gpuMock(compare, {
        output: [2, 2],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
          outputWidth: 2,
          outputHeight: 2,
        },
      })(deltas, switchY, switchX);

      expect(results).toEqual([[0,0], [0,10]]);
    });
  });
  describe('.compare3D (back propagation)', () => {
    test('can pool a simple matrix', () => {
      const deltas = [[[1,2],[3,4]]];
      const switchX = [[[1,0], [1,0]]];
      const switchY = [[[1,1],[0,0]]];
      const results = gpuMock(compare3D, {
        output: [2, 2, 1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
          outputWidth: 2,
          outputHeight: 2,
        },
      })(deltas, switchY, switchX);

      expect(results).toEqual([[[4,3], [2,1]]]);
    });
    test('can pool a simple matrix', () => {
      const deltas = [[[1,2],[3,4]]];
      const switchX = [[[1,1],[1,1]]];
      const switchY = [[[1,1],[1,1]]];
      const results = gpuMock(compare3D, {
        output: [2, 2, 1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
          outputWidth: 2,
          outputHeight: 2,
        },
      })(deltas, switchY, switchX);

      expect(results).toEqual([[[0,0], [0,10]]]);
    });
  });
});
