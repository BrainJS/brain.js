import assert from 'assert';
import Vocab from '../../src/utilities/vocab';

describe('vocab', function() {
  let vocab = new Vocab('abcdefghijklmnopqrstuvwxyz'.split(''));
  describe('toIndexes', function() {
    it('does not have zeros', function() {
      let vocabIndexes = vocab.toIndexes('abcdefghijklmnopqrstuvwxyz'.split(''));
      assert.equal(vocabIndexes[0], 0);
      assert.equal(vocabIndexes[1], 1);
      assert.equal(vocabIndexes[2], 2);
      assert.equal(vocabIndexes[3], 3);
      assert.equal(vocabIndexes[4], 4);
      assert.equal(vocabIndexes[5], 5);
      assert.equal(vocabIndexes[6], 6);
      assert.equal(vocabIndexes[7], 7);
      assert.equal(vocabIndexes[8], 8);
      assert.equal(vocabIndexes[9], 9);
      assert.equal(vocabIndexes[10], 10);
      assert.equal(vocabIndexes[11], 11);
      assert.equal(vocabIndexes[12], 12);
      assert.equal(vocabIndexes[13], 13);
      assert.equal(vocabIndexes[14], 14);
      assert.equal(vocabIndexes[15], 15);
      assert.equal(vocabIndexes[16], 16);
      assert.equal(vocabIndexes[17], 17);
      assert.equal(vocabIndexes[18], 18);
      assert.equal(vocabIndexes[19], 19);
      assert.equal(vocabIndexes[20], 20);
      assert.equal(vocabIndexes[21], 21);
      assert.equal(vocabIndexes[22], 22);
      assert.equal(vocabIndexes[23], 23);
      assert.equal(vocabIndexes[24], 24);
      assert.equal(vocabIndexes[25], 25);
    });
    it('should properly be able to reference indices of cat', function() {
      var vocab = new Vocab(['cat']);
      var asIndexes = [0, 1, 2];
      vocab.toIndexes('cat').forEach(function(v, i) {
        assert(v === asIndexes[i]);
      });
    });
    it('should properly be able to reference indices of math', function() {
      var vocab = new Vocab(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '=', '+']);
      var asIndexes = [0, 11, 8, 10, 8];
      vocab.toIndexes('0+8=8').forEach(function(v, i) {
        assert(v === asIndexes[i]);
      });
    });
  });
  describe('toCharacters', function() {
    it('does not have zeros', function() {
      let vocabCharacters = vocab.toCharacters([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
      assert.equal(vocabCharacters[0], 'a');
      assert.equal(vocabCharacters[1], 'b');
      assert.equal(vocabCharacters[2], 'c');
      assert.equal(vocabCharacters[3], 'd');
      assert.equal(vocabCharacters[4], 'e');
      assert.equal(vocabCharacters[5], 'f');
      assert.equal(vocabCharacters[6], 'g');
      assert.equal(vocabCharacters[7], 'h');
      assert.equal(vocabCharacters[8], 'i');
      assert.equal(vocabCharacters[9], 'j');
      assert.equal(vocabCharacters[10], 'k');
      assert.equal(vocabCharacters[11], 'l');
      assert.equal(vocabCharacters[12], 'm');
      assert.equal(vocabCharacters[13], 'n');
      assert.equal(vocabCharacters[14], 'o');
      assert.equal(vocabCharacters[15], 'p');
      assert.equal(vocabCharacters[16], 'q');
      assert.equal(vocabCharacters[17], 'r');
      assert.equal(vocabCharacters[18], 's');
      assert.equal(vocabCharacters[19], 't');
      assert.equal(vocabCharacters[20], 'u');
      assert.equal(vocabCharacters[21], 'v');
      assert.equal(vocabCharacters[22], 'w');
      assert.equal(vocabCharacters[23], 'x');
      assert.equal(vocabCharacters[24], 'y');
      assert.equal(vocabCharacters[25], 'z');
    });
    it('should properly be able to reference characters of cat', function() {
      var vocab = new Vocab(['cat']);
      var asIndexes = [0, 1, 2];
      var asCharacters = 'cat';
      vocab.toCharacters(asIndexes).forEach(function(v, i) {
        assert(v === asCharacters[i]);
      });
    });
  });

  it('can handle strings', () => {
    const vocab = new Vocab('a big string');
    const indices = vocab.toIndexes('a big string');
    indices.forEach(value => assert(value >= 0));
    assert.equal(vocab.toCharacters(indices).join(''), 'a big string');
  });
  it('can handle array of strings', () => {
    const vocab = new Vocab('a big string'.split(''));
    const indices = vocab.toIndexes('a big string'.split(''));
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(vocab.toCharacters(indices), 'a big string'.split(''));
  });
  it('can handle array of array of strings', () => {
    const vocab = new Vocab(['a big string'.split(''), 'batman was here'.split('')]);
    let indices = vocab.toIndexes('a big string'.split(''));
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(vocab.toCharacters(indices), 'a big string'.split(''));
    indices = vocab.toIndexes('batman was here'.split(''));
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(vocab.toCharacters(indices), 'batman was here'.split(''));
  });
  it('can handle array of numbers', () => {
    const vocab = new Vocab([1, 2, 3]);
    const indices = vocab.toIndexes([1, 2, 3]);
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(vocab.toCharacters(indices), [1, 2, 3]);
  });
  it('can handle array of array of numbers', () => {
    const vocab = new Vocab([[1, 2, 3], [4, 5, 6]]);
    let indices = vocab.toIndexes([1, 2, 3]);
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(vocab.toCharacters(indices), [1, 2, 3]);
    indices = vocab.toIndexes([4, 5, 6]);
    indices.forEach(value => assert(value >= 3));
    assert.deepEqual(vocab.toCharacters(indices), [4, 5, 6]);
  });
  it('can handle array of booleans', () => {
    const vocab = new Vocab([true, false]);
    const indices = vocab.toIndexes([true, false, true, false]);
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(vocab.toCharacters(indices), [true, false, true, false]);
  });
  it('can handle array of array of booleans', () => {
    const vocab = new Vocab([[true], [false]]);
    let indices = vocab.toIndexes([true, false]);
    indices.forEach(value => assert(value >= 0));
    assert.deepEqual(vocab.toCharacters(indices), [true, false]);
  });
  context('when splitting values to input/output', () => {
    it('works', () => {
      const vocab = Vocab.fromArrayInputOutput([1,2,3,4,5,6,7,8,9,0]);
      let indices = vocab.toIndexesInputOutput([1,2,3,4,5], [1,2,3,4,5]);
      assert.deepEqual(vocab.toCharacters(indices), [1,2,3,4,5,'stop-input', 'start-output', 1,2,3,4,5]);
    });
  });
});