import assert from 'assert';
import lookup from '../../src/lookup';

describe('lookup', () => {
  it('toHash()', () => {
    let lup = lookup.toHash({ a: 6, b: 7, c: 8 });

    assert.deepEqual(lup, { a: 0, b: 1, c: 2 });
  });

  it('toTable()', () => {
    let lup = lookup.toTable([{ x: 0, y: 0 },
      { x: 1, z: 0 },
      { q: 0 },
      { x: 1, y: 1 }]);

    assert.deepEqual(lup, { x: 0, y: 1, z: 2, q: 3 })
  });

  it('toArray()', () => {
    let lup = { a: 0, b: 1, c: 2 };

    let array = lookup.toArray(lup, { b: 8, notinlookup: 9 }, 3);

    assert.deepEqual(array, Float32Array.from([0, 8, 0]))
  });

  it('toObject()', () => {
    let lup = { b: 1, a: 0, c: 2 };

    let hash = lookup.toObject(lup, [0, 9, 8]);

    assert.deepEqual(hash, {a: 0, b: 9, c: 8})
  })
});
