const randomWeight = require('../../src/utilities/random-weight');

describe('randomWeight', () => {
  test('weight', () => {
    expect(typeof randomWeight()).toBe('number');
  });
});
