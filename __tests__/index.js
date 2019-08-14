const brain = require('../src/index');

describe('index', () => {
  test('brain', () => {
    expect(brain).toBeDefined();
    expect(brain).toBeInstanceOf(Object);
  });
});
