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
    it('should properly be able to reference indexes of cat', function() {
      var vocab = new Vocab(['cat']);
      var asIndexes = [0, 1, 2];
      vocab.toIndexes('cat').forEach(function(v, i) {
        assert(v === asIndexes[i]);
      });
    });
    it('should properly be able to reference indexes of math', function() {
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
});