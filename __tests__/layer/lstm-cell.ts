import {
  Add,
  lstmCell,
  Multiply,
  MultiplyElement,
  Random,
  RecurrentZeros,
  Sigmoid,
  Tanh,
  Zeros,
} from '../../src/layer';
import { mockLayer, onePlusPlus2D, TestLayer } from '../test-utils';
import { flattenLayers } from '../../src/utilities/flatten-layers';
import { ILayer } from '../../src/layer/base-layer';
import { setup, teardown } from '../../src/utilities/kernel';
import { GPU } from 'gpu.js';

describe('lstm Cell', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  it('properly sets width and height', () => {
    const input = mockLayer({ width: 1, height: 3 });

    const settings = { height: 3 };
    const recurrentInput = new RecurrentZeros();
    const layer = lstmCell(settings, input, recurrentInput);

    expect(layer.width).toEqual(1);
    expect(layer.height).toEqual(settings.height);
  });
  it('throws if height is not a number', () => {
    const input = mockLayer({ width: 1, height: 3 });

    const settings = { height: null };
    const recurrentInput = new RecurrentZeros();
    expect(() => {
      lstmCell(settings, input, recurrentInput);
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
      lstmCell(settings, input, recurrentInput);
      expect(setDimensionsSpy).toHaveBeenCalledWith(1, 33);
    });
  });
  it('properly sets up layers', () => {
    const input = mockLayer({ width: 1, height: 3 });

    const settings = { height: 3 };
    const recurrentInput = new RecurrentZeros();
    const layer = lstmCell(settings, input, recurrentInput);

    const layers = flattenLayers([layer]);
    expect(layers.length).toBe(39);

    // output gate
    expect(layers[0]).toBeInstanceOf(Random);
    expect(layers[0].id).toBe('outputGateWeights');
    expect((layers[0] as Random).settings.std).toBe(0.08);
    expect(layers[1]).toBeInstanceOf(TestLayer);
    expect(layers[1].id).toBe('MockLayer');
    expect(layers[2]).toBeInstanceOf(Multiply);
    expect(layers[3]).toBeInstanceOf(Random);
    expect(layers[3].id).toBe('outputGatePeepholes');
    expect((layers[3] as Random).settings.std).toBe(0.08);
    expect(layers[4]).toBeInstanceOf(RecurrentZeros);
    expect(layers[5]).toBeInstanceOf(Multiply);
    expect(layers[6]).toBeInstanceOf(Add);
    expect(layers[7]).toBeInstanceOf(Zeros);
    expect(layers[7].id).toBe('outputGateBias');
    expect(layers[8]).toBeInstanceOf(Add);
    expect(layers[9]).toBeInstanceOf(Sigmoid);
    expect(layers[9].id).toBe('outputGate');

    // forget gate
    expect(layers[10]).toBeInstanceOf(Random);
    expect(layers[10].id).toBe('forgetGateWeights');
    expect((layers[10] as Random).settings.std).toBe(0.08);
    expect(layers[11]).toBeInstanceOf(Multiply);
    expect(layers[12]).toBeInstanceOf(Random);
    expect(layers[12].id).toBe('forgetGatePeepholes');
    expect((layers[12] as Random).settings.std).toBe(0.08);
    expect(layers[13]).toBeInstanceOf(Multiply);
    expect(layers[14]).toBeInstanceOf(Add);
    expect(layers[14].id).toBe('');
    expect(layers[15]).toBeInstanceOf(Zeros);
    expect(layers[15].id).toBe('forgetGateBias');
    expect(layers[16]).toBeInstanceOf(Add);
    expect(layers[17]).toBeInstanceOf(Sigmoid);
    expect(layers[17].id).toBe('forgetGate');

    // input gate
    expect(layers[18]).toBeInstanceOf(MultiplyElement);
    expect(layers[18].id).toBe('retainCell');
    expect(layers[19]).toBeInstanceOf(Random);
    expect(layers[19].id).toBe('inputGateWeights');
    expect((layers[19] as Random).settings.std).toBe(0.08);
    expect(layers[20]).toBeInstanceOf(Multiply);
    expect(layers[21]).toBeInstanceOf(Random);
    expect(layers[21].id).toBe('inputGatePeepholes');
    expect((layers[21] as Random).settings.std).toBe(0.08);
    expect(layers[22]).toBeInstanceOf(Multiply);
    expect(layers[23]).toBeInstanceOf(Add);
    expect(layers[24]).toBeInstanceOf(Zeros);
    expect(layers[24].id).toBe('inputGateBias');
    expect(layers[25]).toBeInstanceOf(Add);
    expect(layers[26]).toBeInstanceOf(Sigmoid);
    expect(layers[26].id).toBe('inputGate');

    // memory
    expect(layers[27]).toBeInstanceOf(Random);
    expect(layers[27].id).toBe('memoryWeights');
    expect((layers[27] as Random).settings.std).toBe(0.08);
    expect(layers[28]).toBeInstanceOf(Multiply);
    expect(layers[29]).toBeInstanceOf(Random);
    expect(layers[29].id).toBe('memoryPeepholes');
    expect((layers[29] as Random).settings.std).toBe(0.08);
    expect(layers[30]).toBeInstanceOf(Multiply);
    expect(layers[31]).toBeInstanceOf(Add);
    expect(layers[32]).toBeInstanceOf(Zeros);
    expect(layers[32].id).toBe('memoryBias');
    expect(layers[33]).toBeInstanceOf(Add);
    expect(layers[34]).toBeInstanceOf(Tanh);
    expect(layers[34].id).toBe('memory');

    // writeCell
    expect(layers[35]).toBeInstanceOf(MultiplyElement);
    expect(layers[35].id).toBe('writeCell');

    // cell
    expect(layers[36]).toBeInstanceOf(Add);
    expect(layers[36].id).toBe('cell');

    expect(layers[37]).toBeInstanceOf(Tanh);

    // activations
    expect(layers[38]).toBeInstanceOf(MultiplyElement);
    expect(layers[38].id).toBe('activations');
  });

  describe('result', () => {
    it('arrives at correct output', () => {
      const input = mockLayer({ width: 1, height: 3 });
      input.weights = onePlusPlus2D(input.width, input.height);
      const settings = { height: 3 };
      const recurrentInput = new RecurrentZeros();
      const layer = lstmCell(settings, input, recurrentInput);
      const layers = flattenLayers([layer]);

      recurrentInput.weights = onePlusPlus2D(
        recurrentInput.width,
        recurrentInput.height
      );
      const memoryLayers = layers.filter(
        (layer: ILayer) => layer instanceof Random
      );
      memoryLayers.forEach((layer: ILayer) => {
        layer.weights = onePlusPlus2D(layer.width, layer.height);
      });

      layers.forEach((layer) => layer.setupKernels());
      layers.forEach((layer) => layer.predict());

      expect(layers[layers.length - 1].weights).toEqual([
        Float32Array.from([0.9640275835990906]),
        Float32Array.from([0.9950547814369202]),
        Float32Array.from([0.9993293285369873]),
      ]);
    });
  });
});
