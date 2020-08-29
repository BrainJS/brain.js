const zeros = require('../../src/utilities/zeros');

describe('zeros', () => {
  test('should return an array with all zeros', () => {
    const temp = zeros(10);
    const tempCheck = temp.filter((el) => el === 0);

    expect(temp.length).toBe(tempCheck.length);
  });
});
