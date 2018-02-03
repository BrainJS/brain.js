import assert from 'assert';
import deepClone from '../../src/utilities/deepClone';

describe('deepClone', () => {
  it('should copy the same values in deep array', () => {
    const objA = {
      a: "hello",
      c: "test",
      po: 33,
      arr: [1, 2, 3, 4],
      anotherObj: {a: 33, str: "whazzup"}
    };
    const objB = deepClone(objA);

    assert.deepStrictEqual(objA, objB);
  });
  it('should not copy by reference for non-primitive elements', () => {
    const objA = {
      a: "hello",
      c: "test",
      po: 33,
      arr: [1, 2, 3, 4],
      anotherObj: {a: 33, str: "whazzup"}
    };
    const objB = deepClone(objA);
    const tempHolder = objB.arr[2];
    objB.arr[2] = 2;
    assert.notDeepStrictEqual(objA, objB);
    objB.arr[2] = tempHolder;
    objB.anotherObj.str = 'halp';
    assert.notDeepStrictEqual(objA, objB);
  });
});