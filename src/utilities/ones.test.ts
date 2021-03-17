import { ones, ones2D } from './ones';

describe('ones', () => {
  test('should return an array with all ones', () => {
    expect(ones(2)).toEqual(Float32Array.from([1, 1]));
  });
});

describe('ones2D', () => {
  test('should return an array with all ones', () => {
    expect(ones2D(2, 3)).toEqual([
      Float32Array.from([1, 1]),
      Float32Array.from([1, 1]),
      Float32Array.from([1, 1]),
    ]);
  });
});
