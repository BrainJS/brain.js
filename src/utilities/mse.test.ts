import { toArray } from './to-array';
import { zeros } from './zeros';

describe('mse', () => {
  test('should return the same array if an array are passed', () => {
    const collection = zeros(10);
    const temp = toArray(collection);

    expect(collection.constructor).toBe(temp.constructor);
  });

  test('should return an array if object is passed', () => {
    const collection = {
      name: 0, // 'Steve Jobs',
      alive: 1, // false,
    };
    const temp = toArray(collection);

    expect(temp.constructor).toBe(Float32Array);
    expect(temp.length).toBe(Object.keys(collection).length);
  });
});
