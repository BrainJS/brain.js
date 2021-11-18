import { Matrix } from './';

describe('Matrix', () => {
  describe('.constructor()', () => {
    describe('.rows', () => {
      it('leaves rows as 0 if falsey', () => {
        expect(new Matrix(undefined, 2).rows).toBe(0);
      });
      it('sets rows if truthy', () => {
        expect(new Matrix(1, 2).rows).toBe(1);
      });
    });
    describe('.columns', () => {
      it('leaves columns as 0 if falsey', () => {
        expect(new Matrix(1, undefined).columns).toBe(0);
      });
      it('sets columns if truthy', () => {
        expect(new Matrix(1, 2).columns).toBe(2);
      });
    });
    describe('.weights', () => {
      it('sets .weights length from rows * columns size', () => {
        expect(new Matrix(33, 55).weights.length).toBe(33 * 55);
      });
      it('sets .weights value from rows * columns of zeros', () => {
        expect(new Matrix(3, 3).weights).toEqual(new Float32Array(3 * 3));
      });
    });
    describe('.deltas', () => {
      it('sets .deltas from rows * columns size', () => {
        expect(new Matrix(33, 55).deltas.length).toBe(33 * 55);
      });
      it('sets .weights from rows * columns size', () => {
        expect(new Matrix(3, 3).deltas).toEqual(new Float32Array(3 * 3));
      });
    });
  });
  describe('.getWeight()', () => {
    it('throws if index greater than Matrix', () => {
      const matrix = new Matrix(2, 2);
      expect(() => {
        matrix.getWeight(2, 2);
      }).toThrow('get accessor is skewed');
    });
    it('throws if index less than Matrix', () => {
      const matrix = new Matrix(2, 2);
      expect(() => {
        matrix.getWeight(-2, -2);
      }).toThrow('get accessor is skewed');
    });
    it('returns individual weight', () => {
      const matrix = new Matrix(2, 2);
      matrix.weights[0] = 1;
      matrix.weights[1] = 2;
      matrix.weights[2] = 3;
      matrix.weights[3] = 4;
      expect(matrix.getWeight(0, 0)).toBe(1);
      expect(matrix.getWeight(0, 1)).toBe(2);
      expect(matrix.getWeight(1, 0)).toBe(3);
      expect(matrix.getWeight(1, 1)).toBe(4);
    });
  });
  describe('.setWeight()', () => {
    it('throws if index greater than Matrix', () => {
      const matrix = new Matrix(2, 2);
      expect(() => {
        matrix.setWeight(2, 2, 0);
      }).toThrow('set accessor is skewed');
    });
    it('throws if index less than Matrix', () => {
      const matrix = new Matrix(2, 2);
      expect(() => {
        matrix.setWeight(-2, -2, 0);
      }).toThrow('set accessor is skewed');
    });
    it('sets individual weight', () => {
      const matrix = new Matrix(2, 2);
      matrix.setWeight(0, 0, 1);
      matrix.setWeight(0, 1, 2);
      matrix.setWeight(1, 0, 3);
      matrix.setWeight(1, 1, 4);
      expect(matrix.weights[0]).toBe(1);
      expect(matrix.weights[1]).toBe(2);
      expect(matrix.weights[2]).toBe(3);
      expect(matrix.weights[3]).toBe(4);
    });
    it('returns itself', () => {
      const matrix = new Matrix(1, 1);
      expect(matrix.setWeight(0, 0, 0)).toBe(matrix);
    });
  });
  describe('.getDelta()', () => {
    it('throws if index greater than Matrix', () => {
      const matrix = new Matrix(2, 2);
      expect(() => {
        matrix.getDelta(2, 2);
      }).toThrow('get accessor is skewed');
    });
    it('throws if index less than Matrix', () => {
      const matrix = new Matrix(2, 2);
      expect(() => {
        matrix.getDelta(-2, -2);
      }).toThrow('get accessor is skewed');
    });
    it('returns individual weight', () => {
      const matrix = new Matrix(2, 2);
      matrix.deltas[0] = 1;
      matrix.deltas[1] = 2;
      matrix.deltas[2] = 3;
      matrix.deltas[3] = 4;
      expect(matrix.getDelta(0, 0)).toBe(1);
      expect(matrix.getDelta(0, 1)).toBe(2);
      expect(matrix.getDelta(1, 0)).toBe(3);
      expect(matrix.getDelta(1, 1)).toBe(4);
    });
  });
  describe('.setDelta()', () => {
    it('throws if index greater than Matrix', () => {
      const matrix = new Matrix(2, 2);
      expect(() => {
        matrix.setDelta(2, 2, 0);
      }).toThrow('set accessor is skewed');
    });
    it('throws if index less than Matrix', () => {
      const matrix = new Matrix(2, 2);
      expect(() => {
        matrix.setDelta(-2, -2, 0);
      }).toThrow('set accessor is skewed');
    });
    it('sets individual weight', () => {
      const matrix = new Matrix(2, 2);
      matrix.setDelta(0, 0, 1);
      matrix.setDelta(0, 1, 2);
      matrix.setDelta(1, 0, 3);
      matrix.setDelta(1, 1, 4);
      expect(matrix.deltas[0]).toBe(1);
      expect(matrix.deltas[1]).toBe(2);
      expect(matrix.deltas[2]).toBe(3);
      expect(matrix.deltas[3]).toBe(4);
    });
    it('returns itself', () => {
      const matrix = new Matrix(1, 1);
      expect(matrix.setDelta(0, 0, 0)).toBe(matrix);
    });
  });
  describe('.toJSON()', () => {
    it('serializes with rows, columns, and weights', () => {
      const matrix = new Matrix(3, 3);
      let value = 1;
      for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 3; column++) {
          matrix.setWeight(row, column, value++);
        }
      }
      expect(matrix.toJSON()).toEqual({
        rows: 3,
        columns: 3,
        weights: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      });
    });
  });
  describe('.fromJSON()', () => {
    it('deserializes to Matrix from json', () => {
      const json = {
        rows: 3,
        columns: 3,
        weights: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      };
      const matrix = Matrix.fromJSON(json);
      expect(matrix.rows).toBe(json.rows);
      expect(matrix.columns).toBe(json.columns);
      expect(matrix.weights).toEqual(
        new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9])
      );
    });
  });
  describe('static .fromArray()', () => {
    it('deserializes to Matrix from nested array, populating weights', () => {
      const nestedArray = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const matrix = Matrix.fromArray(nestedArray);
      expect(matrix.rows).toBe(2);
      expect(matrix.columns).toBe(3);
      expect(matrix.weights).toEqual(Float32Array.from([1, 2, 3, 4, 5, 6]));
    });
  });
  describe('.toArray()', () => {
    it('deserializes to Matrix from nested array, populating weights by default', () => {
      const matrix = new Matrix(2, 3);
      matrix.setWeight(0, 0, 1);
      matrix.setWeight(0, 1, 2);
      matrix.setWeight(0, 2, 3);
      matrix.setWeight(1, 0, 4);
      matrix.setWeight(1, 1, 5);
      matrix.setWeight(1, 2, 6);
      expect(matrix.toArray()).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ]);
    });
  });
  describe('.deltasToArray()', () => {
    it('return deltas', () => {
      const matrix = new Matrix(1, 1);
      matrix.deltas[0] = 999;
      expect(matrix.deltasToArray()).toEqual([[999]]);
    });
  });
  describe('.weightsToArray()', () => {
    it('return deltas', () => {
      const matrix = new Matrix(1, 1);
      matrix.weights[0] = 999;
      expect(matrix.weightsToArray()).toEqual([[999]]);
    });
  });
  describe('.fromArray()', () => {
    it('deserializes to Matrix from nested array, populating weights by default', () => {
      const nestedArray = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const matrix = new Matrix(2, 3).fromArray(nestedArray);
      expect(matrix.rows).toBe(2);
      expect(matrix.columns).toBe(3);
      expect(matrix.weights).toEqual(Float32Array.from([1, 2, 3, 4, 5, 6]));
    });
    it('deserializes to Matrix from nested array, populating deltas when defined', () => {
      const nestedArray = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const matrix = new Matrix(2, 3).fromArray(nestedArray, 'deltas');
      expect(matrix.rows).toBe(2);
      expect(matrix.columns).toBe(3);
      expect(matrix.weights).toEqual(Float32Array.from([0, 0, 0, 0, 0, 0]));
      expect(matrix.deltas).toEqual(Float32Array.from([1, 2, 3, 4, 5, 6]));
    });
  });
  describe('.iterate()', () => {
    it('iterates and calls for .column()', () => {
      const column = jest.fn();
      new Matrix(1, 2).iterate({ column });
      expect(column).toHaveBeenCalledWith(0, 0);
      expect(column).toHaveBeenCalledWith(0, 1);
    });
    it('iterates and calls for .row()', () => {
      const row = jest.fn();
      new Matrix(2, 1).iterate({ row });
      expect(row).toHaveBeenCalledWith(0);
      expect(row).toHaveBeenCalledWith(1);
    });
    it('returns this', () => {
      const matrix = new Matrix(2, 1);
      expect(matrix.iterate({ row: () => {} })).toBe(matrix);
    });
  });
});
