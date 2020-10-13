import * as brain from '../src/index';

describe('index', () => {
  test('brain', () => {
    expect(brain).toBeDefined();
    expect(brain).toBeInstanceOf(Object);
  });
});
