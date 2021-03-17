import { brain } from '../src';

describe('index', () => {
  test('brain', () => {
    expect(brain).toBeDefined();
    expect(brain).toBeInstanceOf(Object);
  });
});
