import assert from 'assert';
import feedForward from '../../src/layer/feed-forward';

describe('FeedForward Layer', () => {
  it('properly sets width and height', () => {
    const input = { width: 1, height: 3 };

    const settings = { height: 3 };
    const recurrentInput = {
      setDimensions: (width, height) => {
        recurrentInput.width = width;
        recurrentInput.height = height;
      }
    };

    const layer = feedForward(
      settings,
      input,
      recurrentInput
    );

    assert.equal(layer.width, 1);
    assert.equal(layer.height, settings.height);
  });
});