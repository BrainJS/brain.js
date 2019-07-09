const toArray = require('../../src/utilities/to-array');

describe('to-array', () => {
  test('should convert object to array', () => {
    const obj = { a: 1, b: 5, c: 10, d: 0 };

    expect(toArray(obj)).toBeInstanceOf(Float32Array);
    expect(toArray(obj).length).toBe(4);
  });
});
