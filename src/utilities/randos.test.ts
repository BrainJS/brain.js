import { randos } from './randos';

describe('randos', () => {
  test('should return an array of finite random weights', () => {
    const temp: Float32Array = randos(10);
    const tempCheck: Float32Array = temp.filter((el) => Number.isFinite(el));
    expect(temp.length).toBe(tempCheck.length);
  });
});
