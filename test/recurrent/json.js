import fs from 'fs';
import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import Vocab from '../../src/utilities/vocab';
var vocab = new Vocab(['0','1','2','3','4','5','6','7','8','9','+','=']);

function randomMath() {
  var left = Math.floor(Math.random() * 10);
  var right = Math.floor(Math.random() * 10);
  return left + '+' + right + '=' + (left + right);
}

function runAgainstMath(rnn, skipTests) {
  for (var i = 0; i < 5000; i++) {
    rnn.run(vocab.toIndexes(randomMath()));
    if (i % 10 === 0) {
      console.log(vocab.toCharacters(rnn.predict()).join(''));
    }
  }

  if (skipTests) return;
  var prediction = vocab.toCharacters(rnn.predict()).join('');
  console.log(prediction);
  assert(/[+]/.test(prediction));
  assert(/[=]/.test(prediction));
}

describe('json', function() {
  describe('#toJSON', function() {
    it('can export model as json', function() {
      var jsonString = JSON.stringify(new RNN({
        inputSize: 6, //<- length
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length //<- length
      }).toJSON());

      assert(jsonString.length > 500);
    });
  });

  describe('#fromJSON', function() {
    it('can import model from json', function() {
      var jsonString = JSON.stringify(new RNN({
        inputSize: 6, //<- length
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length //<- length
      }).toJSON());

      var clone = new RNN({ json: JSON.parse(jsonString) });

      assert.equal(jsonString, JSON.stringify(clone.toJSON()));
      assert.equal(clone.inputSize, 6);
      assert.equal(clone.inputRange, vocab.characters.length);
      assert.equal(clone.outputSize, vocab.characters.length);
    });
  });
});