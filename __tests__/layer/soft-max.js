import assert from 'assert'
import gpuMock from 'gpu-mock.js'
import {
  compare,
  getExponentials,
  getExponentials3D,
  getMaxValue,
  getMaxValue3D,
  getSum,
  getSum3D,
  predict,
  predict3D

} from '../../src/layer/soft-max'

describe('SoftMax', () => {
  describe('.getExponentials', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [1,2],
        [3,4]
      ]
      const kernel = gpuMock(getExponentials, {
        output: [2,2],
      })
      const result = kernel(weights, [0])
      assert.deepEqual(result, [
        [
          Math.exp(1),
          Math.exp(2),
        ],
        [
          Math.exp(3),
          Math.exp(4),
        ]
      ])
    })
    it('can subtract maxInput and run on a simple matrix', () => {
      const weights = [
        [1,2],
        [3,4]
      ]
      const kernel = gpuMock(getExponentials, {
        output: [2,2],
      })
      const result = kernel(weights, [4])
      assert.deepEqual(result, [
        [
          Math.exp(1 - 4),
          Math.exp(2 - 4),
        ],
        [
          Math.exp(3 - 4),
          Math.exp(4 - 4),
        ]
      ])
    })
  })
  describe('.getExponentials3D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [
          [1,2],
          [3,4]
        ],
        [
          [5,6],
          [7,8],
        ]
      ]
      const kernel = gpuMock(getExponentials3D, {
        output: [2,2,2],
      })
      const result = kernel(weights, [0])
      assert.deepEqual(result, [
        [
          [
            Math.exp(1),
            Math.exp(2),
          ],
          [
            Math.exp(3),
            Math.exp(4),
          ]
        ],
        [
          [
            Math.exp(5),
            Math.exp(6),
          ],
          [
            Math.exp(7),
            Math.exp(8),
          ]
        ]
      ])
    })
    it('can subtract maxInput and run on a simple matrix', () => {
      const weights = [
        [
          [1,2],
          [3,4]
        ],
        [
          [5,6],
          [7,8],
        ]
      ]
      const kernel = gpuMock(getExponentials3D, {
        output: [2,2,2],
      })
      const result = kernel(weights, [4])
      assert.deepEqual(result, [
        [
          [
            Math.exp(1 - 4),
            Math.exp(2 - 4),
          ],
          [
            Math.exp(3 - 4),
            Math.exp(4 - 4),
          ]
        ],
        [
          [
            Math.exp(5 - 4),
            Math.exp(6 - 4),
          ],
          [
            Math.exp(7 - 4),
            Math.exp(8 - 4),
          ]
        ]
      ])
    })
  })
  describe('.getMaxValue', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [1,2],
        [3,4],
      ]
      const kernel = gpuMock(getMaxValue, {
        output: [1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
        }
      })
      const result = kernel(weights)
      assert.deepEqual(result, [4])
    })
  })
  describe('.getMaxValue3D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [
          [1,2],
          [3,4],
        ],
        [
          [5,6],
          [7,8],
        ]
      ]
      const kernel = gpuMock(getMaxValue3D, {
        output: [1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
          inputDepth: 2
        }
      })
      const result = kernel(weights)
      assert.deepEqual(result, [8])
    })
  })
  describe('.getSum', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [1,2],
        [3,4],
      ]
      const kernel = gpuMock(getSum, {
        output: [1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
        }
      })
      const result = kernel(weights)
      assert.deepEqual(result, [10])
    })
  })
  describe('.getSum3D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [
          [1,2],
          [3,4],
        ],
        [
          [5,6],
          [7,8],
        ]
      ]
      const kernel = gpuMock(getSum3D, {
        output: [1],
        constants: {
          inputWidth: 2,
          inputHeight: 2,
          inputDepth: 2
        }
      })
      const result = kernel(weights)
      assert.deepEqual(result, [36])
    })
  })
  describe('.predict', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [1,2],
        [3,4],
      ]
      const kernel = gpuMock(predict, {
        output: [2,2],
      })
      const result = kernel(weights, [2])
      assert.deepEqual(result, [
        [0.5,1],
        [1.5,2]
      ])
    })
  })
  describe('.predict3D', () => {
    it('can run on a simple matrix', () => {
      const weights = [
        [
          [1,2],
          [3,4],
        ],
        [
          [5,6],
          [7,8]
        ]
      ]
      const kernel = gpuMock(predict3D, {
        output: [2,2,2],
      })
      const result = kernel(weights, [2])
      assert.deepEqual(result, [
        [
          [0.5,1],
          [1.5,2]
        ],
        [
          [2.5,3],
          [3.5,4]
        ]
      ])
    })
  })
})