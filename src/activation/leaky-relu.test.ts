import * as leakyRelu from './leaky-relu';

describe('leakyRelu', () => {
  describe('.active()', () => {
    describe('when weight is greater than 0', () => {
      it('returns weight', () => {
        expect(leakyRelu.activate(1)).toBe(1);
      });
    });

    describe('when value is equal to 0', () => {
      it('returns value * 0.01', () => {
        expect(leakyRelu.activate(0)).toBe(0);
      });
    });

    describe('when value is less than 0', () => {
      it('returns value * 0.01', () => {
        expect(leakyRelu.activate(-1)).toBe(-0.01);
      });
    });
  });
  describe('.measure()', () => {
    describe('when weight is greater than 0', () => {
      it('returns error', () => {
        const error = 0.1;
        expect(leakyRelu.measure(1, error)).toBe(error);
      });
    });
    describe('when weight is equal to 0', () => {
      it('returns error', () => {
        const error = 0.1;
        expect(leakyRelu.measure(1, error)).toBe(error);
      });
    });
    describe('when weight is less than 0', () => {
      it('returns error', () => {
        expect(leakyRelu.measure(-1, 1)).toBe(0.01);
      });
    });
  });
});
