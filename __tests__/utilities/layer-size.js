const { checkSameSize } = require('../../src/utilities/layer-size');

describe('LayerSize', () => {
  describe('checkSameSize', () => {
    describe('if layer1.width !== layer2.width', () => {
      it('throws', () => {
        expect(() => {
          checkSameSize(
            {
              width: 10,
            },
            {
              width: 10.1,
            }
          );
        }).toThrow();
      });
    });
    describe('if layer1.width === layer2.width', () => {
      it('throws', () => {
        expect(() => {
          checkSameSize(
            {
              width: 10,
            },
            {
              width: 10,
            }
          );
        }).not.toThrow();
      });
    });
    describe('if layer1.height !== layer2.height', () => {
      it('throws', () => {
        expect(() => {
          checkSameSize(
            {
              height: 10,
            },
            {
              height: 10.1,
            }
          );
        }).toThrow();
      });
    });
    describe('if layer1.height === layer2.height', () => {
      it('throws', () => {
        expect(() => {
          checkSameSize(
            {
              height: 10,
            },
            {
              height: 10,
            }
          );
        }).not.toThrow();
      });
    });
  });
});
