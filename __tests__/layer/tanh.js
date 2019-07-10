const gpuMock = require('gpu-mock.js');
const { predict, compare } = require('../../src/layer/tanh');

function shave(array) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (Array.isArray(array[i])) {
      result.push(shave(array[i]));
    } else {
      result.push(array[i].toFixed(16));
    }
  }
}

describe('Tanh Layer', () => {
  describe('.predict (forward propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]];
      const results = gpuMock(predict, { output: [3, 3] })(inputs);

      expect(shave(results)).toEqual(
        shave([
          [0.0996679946249559, 0.19737532022490412, 0.291312612451591],
          [0.37994896225522495, 0.4621171572600098, 0.5370495669980353],
          [0.6043677771171635, 0.664036770267849, 0.7162978701990244],
        ])
      );
    });
  });

  describe('.compare (back propagation)', () => {
    test('can tanh a simple matrix', () => {
      const inputs = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]];
      const deltas = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
      const results = gpuMock(compare, { output: [3, 3] })(inputs, deltas);

      expect(shave(results)).toEqual(
        shave([
          [0.99, 0.96, 0.91],
          [0.84, 0.75, 0.64],
          [0.51, 0.3599999999999999, 0.18999999999999995],
        ])
      );
    });
  });
});
