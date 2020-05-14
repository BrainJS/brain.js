const { Activation } = require('../../src/layer/activation');

describe('Activation Abstract Layer', () => {
  describe('.constructor()', () => {
    describe('calls .validate()', () => {
      beforeEach(() => {
        jest.spyOn(Activation.prototype, 'validate');
      });
      afterEach(() => {
        Activation.prototype.validate.mockRestore();
      });
      test('.validate() call', () => {
        const l = new Activation({});
        expect(l.validate).toBeCalled();
      });
    });
    test('inputLayer', () => {
      const mockInputLayer = {};
      const l = new Activation(mockInputLayer);
      expect(l.inputLayer).toBe(mockInputLayer);
    });
    test('dimensions', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const l = new Activation({ width, height, depth });
      expect(l.width).toBe(width);
      expect(l.height).toBe(height);
      expect(l.depth).toBe(depth);
    });
    test('2d weights & deltas', () => {
      const width = 3;
      const height = 4;
      const l = new Activation({ width, height });
      expect(l.weights.length).toBe(height);
      expect(l.weights[0].length).toBe(width);
      expect(typeof l.weights[0][0]).toBe('number');
    });
    test('3d weights & deltas', () => {
      const width = 3;
      const height = 4;
      const depth = 5;
      const l = new Activation({ width, height, depth });
      expect(l.weights.length).toBe(depth);
      expect(l.weights[0].length).toBe(height);
      expect(l.weights[0][0].length).toBe(width);
      expect(typeof l.weights[0][0][0]).toBe('number');
    });
    test('praxis', () => {
      const mockPraxisInstance = {};
      const mockPraxis = jest.fn(() => mockPraxisInstance);
      const settings = { praxis: mockPraxis };
      const mockInputLayer = {};
      const l = new Activation(mockInputLayer, settings);
      expect(mockPraxis).toBeCalled();
      expect(l.praxis).toBe(mockPraxisInstance);
    });
  });
});
