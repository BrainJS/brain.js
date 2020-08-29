const lookup = require('../src/lookup');

describe('lookup', () => {
  it('toHash()', () => {
    const lup = lookup.toHash({ a: 6, b: 7, c: 8 });

    expect(lup).toEqual({ a: 0, b: 1, c: 2 });
  });

  it('toTable()', () => {
    const lup = lookup.toTable([
      { x: 0, y: 0 },
      { x: 1, z: 0 },
      { q: 0 },
      { x: 1, y: 1 },
    ]);

    expect(lup).toEqual({ x: 0, y: 1, z: 2, q: 3 });
  });

  it('toArray()', () => {
    const lup = { a: 0, b: 1, c: 2 };

    const array = lookup.toArray(lup, { b: 8, notinlookup: 9 }, 3);

    expect(array).toEqual(Float32Array.from([0, 8, 0]));
  });

  it('toObject()', () => {
    const lup = { b: 1, a: 0, c: 2 };

    const hash = lookup.toObject(lup, [0, 9, 8]);

    expect(hash).toEqual({ a: 0, b: 9, c: 8 });
  });

  describe('dataShape', () => {
    describe('collection usage', () => {
      it('can identify array,array,number', () => {
        const individual = lookup.dataShape([0]);
        const collection = lookup.dataShape([[0]]);

        expect(individual).toEqual(['array', 'number']);
        expect(collection).toEqual(['array', 'array', 'number']);
      });

      it('can identify array,array,array,number', () => {
        const individual = lookup.dataShape([[0]]);
        const collection = lookup.dataShape([[[0]]]);
        expect(individual).toEqual(['array', 'array', 'number']);
        expect(collection).toEqual(['array', 'array', 'array', 'number']);
      });

      it('can identify array,object,number', () => {
        const individual = lookup.dataShape({ one: 0 });
        const collection = lookup.dataShape([{ one: 0 }]);
        expect(individual).toEqual(['object', 'number']);
        expect(collection).toEqual(['array', 'object', 'number']);
      });

      it('can identify array,array,object,number', () => {
        const individual = lookup.dataShape([{ one: 0 }]);
        const collection = lookup.dataShape([[{ one: 0 }]]);
        expect(individual).toEqual(['array', 'object', 'number']);
        expect(collection).toEqual(['array', 'array', 'object', 'number']);
      });

      it('can identify array,datum,array,number', () => {
        const individual = lookup.dataShape({ input: [0], output: [0] });
        const collection = lookup.dataShape([{ input: [0], output: [0] }]);
        expect(individual).toEqual(['datum', 'array', 'number']);
        expect(collection).toEqual(['array', 'datum', 'array', 'number']);
      });

      it('can identify array,datum,object,number', () => {
        const individual = lookup.dataShape({
          input: { one: 0 },
          output: { none: 0 },
        });
        const collection = lookup.dataShape([
          { input: { one: 0 }, output: { none: 0 } },
        ]);
        expect(individual).toEqual(['datum', 'object', 'number']);
        expect(collection).toEqual(['array', 'datum', 'object', 'number']);
      });

      it('can identify array,datum,array,array,number', () => {
        const individual = lookup.dataShape({ input: [[0]], output: [[0]] });
        const collection = lookup.dataShape([{ input: [[0]], output: [[0]] }]);
        expect(individual).toEqual(['datum', 'array', 'array', 'number']);
        expect(collection).toEqual([
          'array',
          'datum',
          'array',
          'array',
          'number',
        ]);
      });

      it('can identify array,datum,array,object,number', () => {
        const individual = lookup.dataShape({
          input: [{ one: 0 }],
          output: [{ one: 0 }],
        });
        const collection = lookup.dataShape([
          { input: [{ one: 0 }], output: [{ one: 0 }] },
        ]);
        expect(individual).toEqual(['datum', 'array', 'object', 'number']);
        expect(collection).toEqual([
          'array',
          'datum',
          'array',
          'object',
          'number',
        ]);
      });
    });
  });
});
