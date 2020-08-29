const {
  DataFormatter,
  defaultRNNFormatter,
} = require('../../src/utilities/data-formatter');

describe('DataFormatter', () => {
  test('does not have zeros', () => {
    const dataFormatter = new DataFormatter(
      'abcdefghijklmnopqrstuvwxyz'.split('')
    );
    const indexes = dataFormatter.toIndexes(
      'abcdefghijklmnopqrstuvwxyz'.split('')
    );

    expect(indexes[0]).toBe(0);
    expect(indexes[1]).toBe(1);
    expect(indexes[2]).toBe(2);
    expect(indexes[3]).toBe(3);
    expect(indexes[4]).toBe(4);
    expect(indexes[5]).toBe(5);
    expect(indexes[6]).toBe(6);
    expect(indexes[7]).toBe(7);
    expect(indexes[8]).toBe(8);
    expect(indexes[9]).toBe(9);
    expect(indexes[10]).toBe(10);
    expect(indexes[11]).toBe(11);
    expect(indexes[12]).toBe(12);
    expect(indexes[13]).toBe(13);
    expect(indexes[14]).toBe(14);
    expect(indexes[15]).toBe(15);
    expect(indexes[16]).toBe(16);
    expect(indexes[17]).toBe(17);
    expect(indexes[18]).toBe(18);
    expect(indexes[19]).toBe(19);
    expect(indexes[20]).toBe(20);
    expect(indexes[21]).toBe(21);
    expect(indexes[22]).toBe(22);
    expect(indexes[23]).toBe(23);
    expect(indexes[24]).toBe(24);
    expect(indexes[25]).toBe(25);
  });

  test('should properly be able to reference indices of cat', () => {
    const dataFormatter = new DataFormatter(['cat']);
    const asIndexes = [0, 1, 2];

    dataFormatter.toIndexes('cat').forEach((v, i) => {
      expect(v).toBe(asIndexes[i]);
    });
  });

  test('should properly be able to reference indices of math', () => {
    const dataFormatter = new DataFormatter([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '=',
      '+',
    ]);
    const asIndexes = [0, 11, 8, 10, 8];

    dataFormatter.toIndexes('0+8=8').forEach((v, i) => {
      expect(v).toBe(asIndexes[i]);
    });
  });

  test('does not have zeros', () => {
    const dataFormatter = new DataFormatter(
      'abcdefghijklmnopqrstuvwxyz'.split('')
    );
    const characters = dataFormatter.toCharacters([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
    ]);

    expect(characters[0]).toBe('a');
    expect(characters[1]).toBe('b');
    expect(characters[2]).toBe('c');
    expect(characters[3]).toBe('d');
    expect(characters[4]).toBe('e');
    expect(characters[5]).toBe('f');
    expect(characters[6]).toBe('g');
    expect(characters[7]).toBe('h');
    expect(characters[8]).toBe('i');
    expect(characters[9]).toBe('j');
    expect(characters[10]).toBe('k');
    expect(characters[11]).toBe('l');
    expect(characters[12]).toBe('m');
    expect(characters[13]).toBe('n');
    expect(characters[14]).toBe('o');
    expect(characters[15]).toBe('p');
    expect(characters[16]).toBe('q');
    expect(characters[17]).toBe('r');
    expect(characters[18]).toBe('s');
    expect(characters[19]).toBe('t');
    expect(characters[20]).toBe('u');
    expect(characters[21]).toBe('v');
    expect(characters[22]).toBe('w');
    expect(characters[23]).toBe('x');
    expect(characters[24]).toBe('y');
    expect(characters[25]).toBe('z');
  });

  test('should properly be able to reference characters of cat', () => {
    const dataFormatter = new DataFormatter(['cat']);
    const asIndexes = [0, 1, 2];
    const asCharacters = 'cat';

    dataFormatter.toCharacters(asIndexes).forEach((v, i) => {
      expect(v).toBe(asCharacters[i]);
    });
  });

  test('can handle strings', () => {
    const dataFormatter = new DataFormatter('a big string');
    const indices = dataFormatter.toIndexes('a big string');
    indices.forEach((value) => expect(value >= 0));

    expect(dataFormatter.toCharacters(indices).join('')).toBe('a big string');
  });

  test('can handle array of strings', () => {
    const dataFormatter = new DataFormatter('a big string'.split(''));
    const indices = dataFormatter.toIndexes('a big string'.split(''));
    indices.forEach((value) => expect(value >= 0));

    expect(dataFormatter.toCharacters(indices)).toEqual(
      'a big string'.split('')
    );
  });

  test('can handle array of array of strings', () => {
    const dataFormatter = new DataFormatter([
      'a big string'.split(''),
      'batman was here'.split(''),
    ]);
    let indices = dataFormatter.toIndexes('a big string'.split(''));
    indices.forEach((value) => expect(value >= 0));

    expect(dataFormatter.toCharacters(indices)).toEqual(
      'a big string'.split('')
    );

    indices = dataFormatter.toIndexes('batman was here'.split(''));
    indices.forEach((value) => expect(value >= 0));

    expect(dataFormatter.toCharacters(indices)).toEqual(
      'batman was here'.split('')
    );
  });

  test('can handle array of numbers', () => {
    const dataFormatter = new DataFormatter([1, 2, 3]);
    const indices = dataFormatter.toIndexes([1, 2, 3]);
    indices.forEach((value) => expect(value >= 0));

    expect(dataFormatter.toCharacters(indices)).toEqual([1, 2, 3]);
  });

  test('can handle array of array of numbers', () => {
    const dataFormatter = new DataFormatter([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    let indices = dataFormatter.toIndexes([1, 2, 3]);
    indices.forEach((value) => expect(value >= 0));

    expect(dataFormatter.toCharacters(indices)).toEqual([1, 2, 3]);

    indices = dataFormatter.toIndexes([4, 5, 6]);
    indices.forEach((value) => expect(value >= 3));

    expect(dataFormatter.toCharacters(indices)).toEqual([4, 5, 6]);
  });

  test('can handle array of booleans', () => {
    const dataFormatter = new DataFormatter([true, false]);
    const indices = dataFormatter.toIndexes([true, false, true, false]);
    indices.forEach((value) => expect(value >= 0));

    expect(dataFormatter.toCharacters(indices)).toEqual([
      true,
      false,
      true,
      false,
    ]);
  });

  test('can handle array of array of booleans', () => {
    const dataFormatter = new DataFormatter([[true], [false]]);
    const indices = dataFormatter.toIndexes([true, false]);
    indices.forEach((value) => expect(value >= 0));

    expect(dataFormatter.toCharacters(indices)).toEqual([true, false]);
  });

  test('when splitting values to input/output', () => {
    const dataFormatter = DataFormatter.fromArrayInputOutput([
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      0,
    ]);
    const indices = dataFormatter.toIndexesInputOutput(
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5]
    );

    expect(dataFormatter.toCharacters(indices)).toEqual([
      1,
      2,
      3,
      4,
      5,
      1,
      2,
      3,
      4,
      5,
    ]);
  });
});

describe('defaultRNNFormatter', () => {
  test('handles data.input & data.output of string', () => {
    const mockNet = {
      formatDataIn: jest.fn(),
    };
    defaultRNNFormatter.call(mockNet, [{ input: '1', output: '2' }]);
    expect(mockNet.formatDataIn).toBeCalledWith('1', '2');
  });
  test('handles data.input & data.output of number', () => {
    const mockNet = {
      formatDataIn: jest.fn(),
    };
    defaultRNNFormatter.call(mockNet, [{ input: 1, output: 2 }]);
    expect(mockNet.formatDataIn).toBeCalledWith('1', '2');
  });
  test('handles data.input & data.output of string[]', () => {
    const mockNet = {
      formatDataIn: jest.fn(),
    };
    defaultRNNFormatter.call(mockNet, [
      { input: ['1', '2'], output: ['3', '4'] },
    ]);
    expect(mockNet.formatDataIn).toBeCalledWith(['1', '2'], ['3', '4']);
  });
  test('handles data.input & data.output of number[]', () => {
    const mockNet = {
      formatDataIn: jest.fn(),
    };
    defaultRNNFormatter.call(mockNet, [{ input: [1, 2], output: [3, 4] }]);
    expect(mockNet.formatDataIn).toBeCalledWith(['1', '2'], ['3', '4']);
  });
});
