const tanh = require('../../src/activation/tanh');

describe('tanh', () => {
  describe('.active()', () => {
    it('matches for value 1', () => {
      expect(tanh.activate(1).toFixed(5)).toBe(Math.tanh(1).toFixed(5));
    });
  });
  describe('.measure()', () => {
    it('matches for value .7', () => {
      expect(tanh.measure(0.7, 0.5).toFixed(5)).toBe('0.25500');
    });
  });
});
