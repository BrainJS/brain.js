import { feedForward } from './feed-forward';
import { mockLayer } from '../test-utils';

describe('FeedForward Layer', () => {
  test('properly sets width and height', () => {
    const input = mockLayer({ width: 1, height: 3 });
    const settings = { height: 3 };
    const layer = feedForward(settings, input);

    expect(layer.width).toBe(1);
    expect(layer.height).toBe(settings.height);
  });
});
