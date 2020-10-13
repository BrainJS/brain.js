describe('tests', () => {
  test("children's-book", () => {
    expect(() => {
      require('../examples/javascript/childrens-book');
    }).not.toThrow();
  });
  test('cross validation', () => {
    expect(() => {
      require('../examples/javascript/cross-validate');
    }).not.toThrow();
  });
  test('gpu fallback', () => {
    expect(() => {
      require('../examples/javascript/gpu-fallback');
    }).not.toThrow();
  });
  test('learn math', () => {
    expect(() => {
      require('../examples/javascript/learn-math');
    }).not.toThrow();
  });
  test('predict numbers', () => {
    expect(() => {
      require('../examples/javascript/predict-numbers');
    }).not.toThrow();
  });
  test('stream example', () => {
    expect(() => {
      require('../examples/javascript/stream-example');
    }).not.toThrow();
  });
  test('string classification', () => {
    expect(() => {
      require('../examples/javascript/string-classification');
    }).not.toThrow();
  });
  test('which letter simple', () => {
    expect(() => {
      require('../examples/javascript/which-letter-simple');
    }).not.toThrow();
  });
});
