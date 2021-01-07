import { GPU } from 'gpu.js';
import { gpuMock } from 'gpu-mock.js';

import { setup, teardown } from '../../src/utilities/kernel';

import {
  compare,
  compare2D,
  compare3D,
  // getExponentials,
  getExponentials2D,
  getExponentials3D,
  // getMaxValue,
  getMaxValue2D,
  getMaxValue3D,
  // getSum,
  getSum2D,
  getSum3D,
  // predict,
  predict2D,
  predict3D,
} from '../../src/layer/soft-max';

describe('SoftMax', () => {
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
  describe('.compare', () => {
    it('can run on a simple matrix', () => {
      const exponentials = [1, 2, 3, 4];
      const kernel = gpuMock(compare, {
        output: [4],
      });
      expect(kernel(0, exponentials)).toEqual(Float32Array.from([-0, 2, 3, 4]));
      expect(kernel(1, exponentials)).toEqual(Float32Array.from([1, 1, 3, 4]));
      expect(kernel(2, exponentials)).toEqual(Float32Array.from([1, 2, 2, 4]));
      expect(kernel(3, exponentials)).toEqual(Float32Array.from([1, 2, 3, 3]));
    });
  });
  describe('.compare2D', () => {
    it('can run on a simple matrix', () => {
      const exponentials = [
        [1, 2],
        [3, 4],
      ];
      const kernel = gpuMock(compare2D, {
        output: [2, 2],
      });
      expect(kernel(0, exponentials)).toEqual([
        Float32Array.from([-0, 2]),
        Float32Array.from([3, 4]),
      ]);
      expect(kernel(1, exponentials)).toEqual([
        Float32Array.from([1, 1]),
        Float32Array.from([3, 4]),
      ]);
      expect(kernel(2, exponentials)).toEqual([
        Float32Array.from([1, 2]),
        Float32Array.from([2, 4]),
      ]);
      expect(kernel(3, exponentials)).toEqual([
        Float32Array.from([1, 2]),
        Float32Array.from([3, 3]),
      ]);
    });
  });
  describe('.compare3D', () => {
    it('can run on a simple matrix', () => {
      const exponentials = [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ];
      const kernel = gpuMock(compare3D, {
        output: [2, 2, 2],
      });
      expect(kernel(0, exponentials)).toEqual([
        [Float32Array.from([-0, 2]), Float32Array.from([3, 4])],
        [Float32Array.from([5, 6]), Float32Array.from([7, 8])],
      ]);
      expect(kernel(1, exponentials)).toEqual([
        [Float32Array.from([1, 1]), Float32Array.from([3, 4])],
        [Float32Array.from([5, 6]), Float32Array.from([7, 8])],
      ]);
      expect(kernel(2, exponentials)).toEqual([
        [Float32Array.from([1, 2]), Float32Array.from([2, 4])],
        [Float32Array.from([5, 6]), Float32Array.from([7, 8])],
      ]);
      expect(kernel(3, exponentials)).toEqual([
        [Float32Array.from([1, 2]), Float32Array.from([3, 3])],
        [Float32Array.from([5, 6]), Float32Array.from([7, 8])],
      ]);
      expect(kernel(4, exponentials)).toEqual([
        [Float32Array.from([1, 2]), Float32Array.from([3, 4])],
        [Float32Array.from([4, 6]), Float32Array.from([7, 8])],
      ]);
      expect(kernel(5, exponentials)).toEqual([
        [Float32Array.from([1, 2]), Float32Array.from([3, 4])],
        [Float32Array.from([5, 5]), Float32Array.from([7, 8])],
      ]);
      expect(kernel(6, exponentials)).toEqual([
        [Float32Array.from([1, 2]), Float32Array.from([3, 4])],
        [Float32Array.from([5, 6]), Float32Array.from([6, 8])],
      ]);
      expect(kernel(7, exponentials)).toEqual([
        [Float32Array.from([1, 2]), Float32Array.from([3, 4])],
        [Float32Array.from([5, 6]), Float32Array.from([7, 7])],
      ]);
    });
  });
  describe('.getExponentials2D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [1, 2],
        [3, 4],
      ];
      const kernel = gpuMock(getExponentials2D, {
        output: [2, 2],
      });
      const result = kernel(weights, [0]);
      expect(result).toEqual([
        new Float32Array([Math.exp(1), Math.exp(2)]),
        new Float32Array([Math.exp(3), Math.exp(4)]),
      ]);
    });
    it('can subtract maxInput and run on a simple matrix', () => {
      const weights = [
        [1, 2],
        [3, 4],
      ];
      const kernel = gpuMock(getExponentials2D, {
        output: [2, 2],
      });
      const result = kernel(weights, [4]);
      expect(result).toEqual([
        new Float32Array([Math.exp(1 - 4), Math.exp(2 - 4)]),
        new Float32Array([Math.exp(3 - 4), Math.exp(4 - 4)]),
      ]);
    });
  });
  describe('.getExponentials3D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ];
      const kernel = gpuMock(getExponentials3D, {
        output: [2, 2, 2],
      });
      const result = kernel(weights, [0]);
      expect(result).toEqual([
        [
          new Float32Array([Math.exp(1), Math.exp(2)]),
          new Float32Array([Math.exp(3), Math.exp(4)]),
        ],
        [
          new Float32Array([Math.exp(5), Math.exp(6)]),
          new Float32Array([Math.exp(7), Math.exp(8)]),
        ],
      ]);
    });
    it('can subtract maxInput and run on a simple matrix', () => {
      const weights = [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ];
      const kernel = gpuMock(getExponentials3D, {
        output: [2, 2, 2],
      });
      const result = kernel(weights, [4]);
      expect(result).toEqual([
        [
          new Float32Array([Math.exp(1 - 4), Math.exp(2 - 4)]),
          new Float32Array([Math.exp(3 - 4), Math.exp(4 - 4)]),
        ],
        [
          new Float32Array([Math.exp(5 - 4), Math.exp(6 - 4)]),
          new Float32Array([Math.exp(7 - 4), Math.exp(8 - 4)]),
        ],
      ]);
    });
  });
  describe('.getMaxValue2D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [1, 2],
        [3, 4],
      ];
      const kernel = gpuMock(getMaxValue2D, {
        output: [1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
        },
      });
      const result = kernel(weights);
      expect(result).toEqual(Float32Array.from([4]));
    });
  });
  describe('.getMaxValue3D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ];
      const kernel = gpuMock(getMaxValue3D, {
        output: [1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
          inputDepth: 2,
        },
      });
      const result = kernel(weights);
      expect(result).toEqual(Float32Array.from([8]));
    });
  });
  describe('.getSum2D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [1, 2],
        [3, 4],
      ];
      const kernel = gpuMock(getSum2D, {
        output: [1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
        },
      });
      const result = kernel(weights);
      expect(result).toEqual(Float32Array.from([10]));
    });
  });
  describe('.getSum3D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ];
      const kernel = gpuMock(getSum3D, {
        output: [1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
          inputDepth: 2,
        },
      });
      const result = kernel(weights);
      expect(result).toEqual(Float32Array.from([36]));
    });
  });
  describe('.predict2D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [1, 2],
        [3, 4],
      ];
      const kernel = gpuMock(predict2D, {
        output: [2, 2],
      });
      const result = kernel(weights, [2]);
      expect(result).toEqual([
        Float32Array.from([0.5, 1]),
        Float32Array.from([1.5, 2]),
      ]);
    });
  });
  describe('.predict3D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ];
      const kernel = gpuMock(predict3D, {
        output: [2, 2, 2],
      });
      const result = kernel(weights, [2]);
      expect(result).toEqual([
        [Float32Array.from([0.5, 1]), Float32Array.from([1.5, 2])],
        [Float32Array.from([2.5, 3]), Float32Array.from([3.5, 4])],
      ]);
    });
  });
});
