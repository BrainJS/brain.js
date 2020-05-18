const ones = require('../../src/utilities/ones');

describe('ones', () => {
  test('should return an array with all ones', () => {
    const temp = ones(10);
    const tempCheck = temp.filter((el) => el === 1);

    expect(temp.length).toBe(tempCheck.length);
  });
});
