const randos = require('../../src/utilities/randos');

describe('randos', () => {
  test('should return an array of finite random weights', () => {
    const temp = randos(10);
    const tempCheck = temp.filter((el) => Number.isFinite(el));

    expect(temp.length).toBe(tempCheck.length);
  });
});
