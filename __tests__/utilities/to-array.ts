import { toArray } from '../../src/utilities/to-array';

describe('to-array', () => {
  it('should convert object to array', () => {
    const obj = { a: 1, b: 5, c: 10, d: 0 };
    const array = toArray(obj);
    expect(array).toBeInstanceOf(Array);
    expect(array).toEqual([1, 5, 10, 0]);
    expect(array.length).toBe(4);
  });
});
