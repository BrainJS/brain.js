const max = require('../../src/utilities/max');

describe('max', () => {
  test('should find max in object', () => {
    const obj = { a: 1, b: 5, c: 10, d: 0 };

    expect(max(obj)).toBe(10);
  });
});
