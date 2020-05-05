const { rnnCell } = require('../../src/layer/rnn-cell');

describe('Recurrent Layer', () => {
  test('properly sets width and height', () => {
    const input = { width: 1, height: 3 };

    const settings = { height: 3 };
    const recurrentInput = {
      setDimensions: (width, height) => {
        recurrentInput.width = width;
        recurrentInput.height = height;
      },
    };

    const layer = rnnCell(settings, input, recurrentInput);

    expect(layer.width).toEqual(1);
    expect(layer.height).toEqual(settings.height);
  });
});
