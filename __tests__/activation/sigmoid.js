const sigmoid = require('../../src/activation/sigmoid');

describe('sigmoid', () => {
  describe('.active()', () => {
    it('matches for value 1', () => {
      expect(sigmoid.activate(1).toFixed(5)).toBe('0.73106');
    });
  });
  describe('.measure()', () => {
    it('matches for value .7', () => {
      expect(sigmoid.measure(0.7, 0.5).toFixed(5)).toBe('0.10500');
    });
  });
});
