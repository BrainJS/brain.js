import { toArray } from '../../src/utilities/to-array';
import { zeros } from '../../src/utilities/zeros';

describe('mse', () => {
  test('should return the same array if an array are passed', () => {
    const collection = zeros(10);
    const temp = toArray(collection);

    expect(collection.constructor).toBe(temp.constructor);
  });

  test('should return an array if object is passed', () => {
    const collection = {
      name: 'Steve Jobs',
      alive: false,
    };
    const temp = toArray(collection);

    expect(temp.constructor).toBe(Float32Array);
    expect(temp.length).toBe(Object.keys(collection).length);
  });
});
