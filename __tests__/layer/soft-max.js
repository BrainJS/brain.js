const assert = require('assert');
const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');

const { setup, teardown } = require('../../src/utilities/kernel');

const {
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
} = require('../../src/layer/soft-max');
const { injectIstanbulCoverage } = require('../test-utils');

describe('SoftMax', () => {
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
  describe('.compare', () => {
    it('can run on a simple matrix', () => {
      const exponentials = [1, 2, 3, 4];
      const kernel = gpuMock(compare, {
        output: [4],
      });
      assert.deepEqual(kernel(0, exponentials), [-0, 2, 3, 4]);
      assert.deepEqual(kernel(1, exponentials), [1, 1, 3, 4]);
      assert.deepEqual(kernel(2, exponentials), [1, 2, 2, 4]);
      assert.deepEqual(kernel(3, exponentials), [1, 2, 3, 3]);
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
      assert.deepEqual(kernel(0, exponentials), [
        [-0, 2],
        [3, 4],
      ]);
      assert.deepEqual(kernel(1, exponentials), [
        [1, 1],
        [3, 4],
      ]);
      assert.deepEqual(kernel(2, exponentials), [
        [1, 2],
        [2, 4],
      ]);
      assert.deepEqual(kernel(3, exponentials), [
        [1, 2],
        [3, 3],
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
      assert.deepEqual(kernel(0, exponentials), [
        [
          [-0, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ]);
      assert.deepEqual(kernel(1, exponentials), [
        [
          [1, 1],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ]);
      assert.deepEqual(kernel(2, exponentials), [
        [
          [1, 2],
          [2, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ]);
      assert.deepEqual(kernel(3, exponentials), [
        [
          [1, 2],
          [3, 3],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ]);
      assert.deepEqual(kernel(4, exponentials), [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [4, 6],
          [7, 8],
        ],
      ]);
      assert.deepEqual(kernel(5, exponentials), [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 5],
          [7, 8],
        ],
      ]);
      assert.deepEqual(kernel(6, exponentials), [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [6, 8],
        ],
      ]);
      assert.deepEqual(kernel(7, exponentials), [
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 7],
        ],
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
      assert.deepEqual(result, [
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
      assert.deepEqual(result, [
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
      assert.deepEqual(result, [
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
      assert.deepEqual(result, [
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
      assert.deepEqual(result, [4]);
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
      assert.deepEqual(result, [8]);
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
      assert.deepEqual(result, [10]);
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
      assert.deepEqual(result, [36]);
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
      assert.deepEqual(result, [
        [0.5, 1],
        [1.5, 2],
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
      assert.deepEqual(result, [
        [
          [0.5, 1],
          [1.5, 2],
        ],
        [
          [2.5, 3],
          [3.5, 4],
        ],
      ]);
    });
  });
});
