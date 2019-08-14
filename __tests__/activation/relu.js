const relu = require('../../src/activation/relu');

describe('relu', () => {
  describe('.active()', () => {
    describe('when weight is greater than 0', () => {
      it('returns weight', () => {
        expect(relu.activate(99)).toBe(99);
      });
    });
    describe('when value is equal to 0', () => {
      it('returns 0', () => {
        expect(relu.activate(0)).toBe(0);
      });
    });
    describe('when value is less than 0', () => {
      it('returns 0', () => {
        expect(relu.activate(0)).toBe(0);
      });
    });
  });
  describe('.measure()', () => {
    describe('when weight is greater than 0', () => {
      it('returns error', () => {
        const error = {};
        expect(relu.measure(1, error)).toBe(error);
      });
    });
    describe('when weight is equal to 0', () => {
      it('returns error', () => {
        const error = {};
        expect(relu.measure(1, error)).toBe(error);
      });
    });
    describe('when weight is less than 0', () => {
      it('returns 0', () => {
        expect(relu.measure(-1, 1)).toBe(0);
      });
    });
  });
});
