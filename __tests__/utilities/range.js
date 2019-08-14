const range = require('../../src/utilities/range');

describe('range', () => {
  test('should return range from start & end', () => {
    expect(range(0, 1)).toBeInstanceOf(Array);
    expect(range(5, 10)).toEqual([5, 6, 7, 8, 9]);
  });
});
