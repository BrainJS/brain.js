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
  });

  describe('dataShape', () => {
    it('can identify array,array,number', () => {
      assert.deepEqual(lookup.dataShape([
        [0]
      ]), ['array','array','number']);
    });

    it('can identify array,array,array,number', () => {
      assert.deepEqual(lookup.dataShape([
        [[0]]
      ]), ['array','array','array','number']);
    });

    it('can identify array,object,number', () => {
      assert.deepEqual(lookup.dataShape([
        { one: 0 }
      ]), ['array','object','number']);
    });

    it('can identify array,array,object,number', () => {
      assert.deepEqual(lookup.dataShape([
        [{ one: 0 }]
      ]), ['array','array','object','number']);
    });

    it('can identify array,datum,array,number', () => {
      assert.deepEqual(lookup.dataShape([
        { input: [0], output: [0] }
      ]), ['array','datum','array','number']);
    });

    it('can identify array,datum,object,number', () => {
      assert.deepEqual(lookup.dataShape([
        { input: { one: 0 }, output: { none: 0 } }
      ]), ['array','datum','object','number']);
    });

    it('can identify array,datum,array,array,number', () => {
      assert.deepEqual(lookup.dataShape([
        { input: [[0]], output: [[0]] }
      ]), ['array','datum','array','array','number']);
    });

    it('can identify array,datum,array,object,number', () => {
      assert.deepEqual(lookup.dataShape([
        { input: [{ one: 0 }], output: [{ one: 0 }] }
      ]), ['array','datum','array','object','number']);
    });
  });
});
