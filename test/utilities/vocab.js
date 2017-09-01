import assert from 'assert';
import DataFormatter from '../../src/utilities/data-formatter';

describe('DataFormatter', function() {
  let dataFormatter = new DataFormatter('abcdefghijklmnopqrstuvwxyz'.split(''));
  describe('toIndexes', function() {
    it('does not have zeros', function() {
      let indexes = dataFormatter.toIndexes('abcdefghijklmnopqrstuvwxyz'.split(''));
      assert.equal(indexes[0], 0);
      assert.equal(indexes[1], 1);
      assert.equal(indexes[2], 2);
      assert.equal(indexes[3], 3);
      assert.equal(indexes[4], 4);
      assert.equal(indexes[5], 5);
      assert.equal(indexes[6], 6);
      assert.equal(indexes[7], 7);
      assert.equal(indexes[8], 8);
      assert.equal(indexes[9], 9);
      assert.equal(indexes[10], 10);
      assert.equal(indexes[11], 11);
      assert.equal(indexes[12], 12);
      assert.equal(indexes[13], 13);
      assert.equal(indexes[14], 14);
      assert.equal(indexes[15], 15);
      assert.equal(indexes[16], 16);
      assert.equal(indexes[17], 17);
      assert.equal(indexes[18], 18);
      assert.equal(indexes[19], 19);
      assert.equal(indexes[20], 20);
      assert.equal(indexes[21], 21);
      assert.equal(indexes[22], 22);
      assert.equal(indexes[23], 23);
      assert.equal(indexes[24], 24);
      assert.equal(indexes[25], 25);
    });
    it('should properly be able to reference indices of cat', function() {
      var dataFormatter = new DataFormatter(['cat']);
      var asIndexes = [0, 1, 2];
      dataFormatter.toIndexes('cat').forEach(function(v, i) {
        assert(v === asIndexes[i]);
      });
    });
    it('should properly be able to reference indices of math', function() {
      var dataFormatter = new DataFormatter(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '=', '+']);
      var asIndexes = [0, 11, 8, 10, 8];
      dataFormatter.toIndexes('0+8=8').forEach(function(v, i) {
        assert(v === asIndexes[i]);
      });
    });
  });
  describe('toCharacters', function() {
    it('does not have zeros', function() {
      let characters = dataFormatter.toCharacters([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
      assert.equal(characters[0], 'a');
      assert.equal(characters[1], 'b');
      assert.equal(characters[2], 'c');
      assert.equal(characters[3], 'd');
      assert.equal(characters[4], 'e');
      assert.equal(characters[5], 'f');
      assert.equal(characters[6], 'g');
      assert.equal(characters[7], 'h');
      assert.equal(characters[8], 'i');
      assert.equal(characters[9], 'j');
      assert.equal(characters[10], 'k');
      assert.equal(characters[11], 'l');
      assert.equal(characters[12], 'm');
      assert.equal(characters[13], 'n');
      assert.equal(characters[14], 'o');
      assert.equal(characters[15], 'p');
      assert.equal(characters[16], 'q');
      assert.equal(characters[17], 'r');
      assert.equal(characters[18], 's');
      assert.equal(characters[19], 't');
      assert.equal(characters[20], 'u');
      assert.equal(characters[21], 'v');
      assert.equal(characters[22], 'w');
      assert.equal(characters[23], 'x');
      assert.equal(characters[24], 'y');
      assert.equal(characters[25], 'z');
    });
    it('should properly be able to reference characters of cat', function() {
      var dataFormatter = new DataFormatter(['cat']);
      var asIndexes = [0, 1, 2];
      var asCharacters = 'cat';
      dataFormatter.toCharacters(asIndexes).forEach(function(v, i) {
        assert(v === asCharacters[i]);
      });
    });
  });

  it('can handle strings', () => {
    const dataFormatter = new DataFormatter('a big string');
    const indices = dataFormatter.toIndexes('a big string');
    indices.forEach(value => assert(value >= 0));
    assert.equal(dataFormatter.toCharacters(indices).join(''), 'a big string');
  });
  it('can handle array of strings', () => {
    const dataFormatter = new DataFormatter('a big string'.split(''));
    const indices = dataFormatter.toIndexes('a big string'.split(''));
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(dataFormatter.toCharacters(indices), 'a big string'.split(''));
  });
  it('can handle array of array of strings', () => {
    const dataFormatter = new DataFormatter(['a big string'.split(''), 'batman was here'.split('')]);
    let indices = dataFormatter.toIndexes('a big string'.split(''));
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(dataFormatter.toCharacters(indices), 'a big string'.split(''));
    indices = dataFormatter.toIndexes('batman was here'.split(''));
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(dataFormatter.toCharacters(indices), 'batman was here'.split(''));
  });
  it('can handle array of numbers', () => {
    const dataFormatter = new DataFormatter([1, 2, 3]);
    const indices = dataFormatter.toIndexes([1, 2, 3]);
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(dataFormatter.toCharacters(indices), [1, 2, 3]);
  });
  it('can handle array of array of numbers', () => {
    const dataFormatter = new DataFormatter([[1, 2, 3], [4, 5, 6]]);
    let indices = dataFormatter.toIndexes([1, 2, 3]);
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(dataFormatter.toCharacters(indices), [1, 2, 3]);
    indices = dataFormatter.toIndexes([4, 5, 6]);
    indices.forEach(value => assert(value >= 3));
    assert.deepEqual(dataFormatter.toCharacters(indices), [4, 5, 6]);
  });
  it('can handle array of booleans', () => {
    const dataFormatter = new DataFormatter([true, false]);
    const indices = dataFormatter.toIndexes([true, false, true, false]);
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(dataFormatter.toCharacters(indices), [true, false, true, false]);
  });
  it('can handle array of array of booleans', () => {
    const dataFormatter = new DataFormatter([[true], [false]]);
    let indices = dataFormatter.toIndexes([true, false]);
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(dataFormatter.toCharacters(indices), [true, false]);
  });
  context('when splitting values to input/output', () => {
    it('works', () => {
      const dataFormatter = DataFormatter.fromArrayInputOutput([1,2,3,4,5,6,7,8,9,0]);
      let indices = dataFormatter.toIndexesInputOutput([1,2,3,4,5], [1,2,3,4,5]);
      assert.deepEqual(dataFormatter.toCharacters(indices), [1,2,3,4,5,'stop-input', 'start-output', 1,2,3,4,5]);
    });
  });
});