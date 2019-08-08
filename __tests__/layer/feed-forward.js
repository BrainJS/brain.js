const { feedForward } = require('../../src/layer/feed-forward');

describe('FeedForward Layer', () => {
  test('properly sets width and height', () => {
    const input = { width: 1, height: 3 };

    const settings = { height: 3 };
    const recurrentInput = {
      setDimensions: (width, height) => {
        recurrentInput.width = width;
        recurrentInput.height = height;
      },
    };

    const layer = feedForward(settings, input, recurrentInput);

    expect(layer.width).toBe(1);
    expect(layer.height).toBe(settings.height);
  });
});
