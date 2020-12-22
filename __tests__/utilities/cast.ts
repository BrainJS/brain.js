import * as cast from '../../src/utilities/cast';
import { ArrayLookupTable } from '../../src/utilities/array-lookup-table';
import { LookupTable } from '../../src/utilities/lookup-table';

describe('cast', () => {
  describe('arraysToFloat32Arrays()', () => {
    it('converts regular nested array to nested Float32Arrays', () => {
      expect(cast.arraysToFloat32Arrays([[1,2,3], [4,5,6]])).toEqual([Float32Array.from([1,2,3]), Float32Array.from([4,5,6])])
    });
  });
  describe('arrayToFloat32Arrays()', () => {
    it('converts regular array to Float32Arrays', () => {
      expect(cast.arrayToFloat32Arrays([1,2,3])).toEqual([Float32Array.from([1]), Float32Array.from([2]), Float32Array.from([3])]);
    });
  });

  describe('arrayToFloat32Array()', () => {
    it('converts regular array to Float32Array', () => {
      expect(cast.arrayToFloat32Array([1,2,3])).toEqual(Float32Array.from([1,2,3]));
    });
  });

  describe('objectsToFloat32Arrays()', () => {
    it('converts array of objects to Float32Arrays', () => {
      const value = [{ one: 1, two: 2, three: 3}];
      const table = new LookupTable(value).table;
      expect(cast.objectsToFloat32Arrays(value, table, 3)).toEqual([Float32Array.from([1,2,3])]);
    });
  });
  describe('objectToFloat32Arrays()', () => {
    it('converts an object to Float32Arrays', () => {
      const value = [{ one: 1, two: 2, three: 3}];
      expect(cast.objectToFloat32Arrays(value[0])).toEqual([Float32Array.from([1]), Float32Array.from([2]), Float32Array.from([3])]);
    });
  });
  describe('objectToFloat32Array()', () => {
    it('converts object to Float32Array', () => {
      const value = [{ one: 1, two: 2, three: 3}];
      const table = new LookupTable(value).table;
      expect(cast.objectToFloat32Array(value[0], table, 3)).toEqual(Float32Array.from([1, 2, 3]));
    });
  });
});
