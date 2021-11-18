import { randomWeight } from './random-weight';

describe('randomWeight', () => {
  test('weight', () => {
    expect(typeof randomWeight()).toBe('number');
  });
});
