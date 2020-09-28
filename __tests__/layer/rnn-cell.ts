import { rnnCell } from '../../src/layer/rnn-cell';
import { mockLayer } from '../test-utils';
import { RecurrentZeros } from '../../src/layer/recurrent-zeros';

describe('Recurrent Layer', () => {
  test('properly sets width and height', () => {
    const input = mockLayer({ width: 1, height: 3 });

    const settings = { height: 3 };
    const recurrentInput = new RecurrentZeros();
    const layer = rnnCell(settings, input, recurrentInput);

    expect(layer.width).toEqual(1);
    expect(layer.height).toEqual(settings.height);
  });
});
