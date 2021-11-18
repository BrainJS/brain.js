import {
  rnnCell,
  RecurrentZeros,
  Add,
  Random,
  Zeros,
  Multiply,
  Relu,
} from './';
import { mockLayer, TestLayer } from '../test-utils';
import { flattenLayers } from '../utilities/flatten-layers';

describe('rnn Cell', () => {
  it('properly sets width and height', () => {
    const input = mockLayer({ width: 1, height: 3 });

    const settings = { height: 3 };
    const recurrentInput = new RecurrentZeros();
    const layer = rnnCell(settings, input, recurrentInput);

    expect(layer.width).toEqual(1);
    expect(layer.height).toEqual(settings.height);
  });
  it('throws if height is not a number', () => {
    const input = mockLayer({ width: 1, height: 3 });

    const settings = { height: null };
    const recurrentInput = new RecurrentZeros();
    expect(() => {
      rnnCell(settings, input, recurrentInput);
    }).toThrow();
  });
  describe('when .setDimensions is available', () => {
    let setDimensionsSpy: jest.SpyInstance;
    beforeEach(() => {
      setDimensionsSpy = jest.spyOn(RecurrentZeros.prototype, 'setDimensions');
    });
    afterEach(() => {
      setDimensionsSpy.mockRestore();
    });
    it('is called', () => {
      const input = mockLayer({ width: 1, height: 3 });

      const settings = { height: 33 };
      const recurrentInput = new RecurrentZeros();
      rnnCell(settings, input, recurrentInput);
      expect(setDimensionsSpy).toHaveBeenCalledWith(1, 33);
    });
  });
  it('properly sets up equation', () => {
    const input = mockLayer({ width: 1, height: 3 });

    const settings = { height: 3 };
    const recurrentInput = new RecurrentZeros();
    const layer = rnnCell(settings, input, recurrentInput);

    const list = flattenLayers([layer]);
    expect(list.length).toBe(10);
    // model
    expect(list[0]).toBeInstanceOf(Random);
    expect(list[0].id).toBe('weight');
    expect((list[0] as Random).settings.std).toBe(0.08);
    expect(list[1]).toBeInstanceOf(TestLayer);
    expect(list[1].id).toBe('MockLayer');
    expect(list[2]).toBeInstanceOf(Multiply);
    expect(list[3]).toBeInstanceOf(Random);
    expect(list[3].id).toBe('transition');
    expect((list[3] as Random).settings.std).toBe(0.08);
    expect(list[4]).toBeInstanceOf(RecurrentZeros);
    expect(list[5]).toBeInstanceOf(Multiply);
    expect(list[6]).toBeInstanceOf(Add);
    expect(list[7]).toBeInstanceOf(Zeros);
    expect(list[7].id).toBe('bias');
    expect(list[8]).toBeInstanceOf(Add);
    expect(list[9]).toBeInstanceOf(Relu);
  });
});
