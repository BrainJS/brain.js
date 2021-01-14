import * as mish from '../../src/activation/mish';

describe('tanh', () => {
  describe('.active()', () => {
    it('matches for value 4', () => {
      expect(mish.activate(4).toFixed(5)).toBe('3.99741');
      expect(mish.activate(1).toFixed(5)).toBe('0.86510');
      expect(mish.activate(0).toFixed(5)).toBe('0.00000');
      expect(mish.activate(-10).toFixed(5)).toBe('-0.00045');
    });
  });

  describe('.measure()', () => {
    it('matches for value .7', () => {
      expect(mish.measure(-10).toFixed(5)).toBe('-0.00041');
    });
  });
});
