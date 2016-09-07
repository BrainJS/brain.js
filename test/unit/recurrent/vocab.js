import assert from 'assert';
import Vocab from '../../../src/recurrent/vocab';

describe('vocab', function() {
  describe('#toIndexes', function() {
    it('should properly be able to reference indexes of cat', function() {
      var vocab = new Vocab(['cat']);
      var asIndexes = [1, 2, 3];
      vocab.toIndexes('cat').forEach(function(v, i) {
        assert(v === asIndexes[i]);
      });
    });
    it('should properly be able to reference indexes of math', function() {
      var vocab = new Vocab(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '=', '+']);
      var asIndexes = [1, 12, 9, 11, 9];
      vocab.toIndexes('0+8=8').forEach(function(v, i) {
        assert(v === asIndexes[i]);
      });
    });
  });
  describe('#toCharacters', function() {
    it('should properly be able to reference characters of cat', function() {
      var vocab = new Vocab(['cat']);
      var asIndexes = [1, 2, 3];
      var asCharacters = 'cat';
      vocab.toCharacters(asIndexes).forEach(function(v, i) {
        assert(v === asCharacters[i]);
      });
    });
  });
});