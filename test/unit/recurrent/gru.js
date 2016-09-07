import fs from 'fs';
import assert from 'assert';
import GRU from '../../../src/recurrent/gru';
import Vocab from '../../../src/recurrent/vocab';
const vocab = new Vocab(['0','1','2','3','4','5','6','7','8','9','+','=', '-', '/', '*']);

function randomMath() {
  var left = Math.floor(Math.random() * 10);
  var right = Math.floor(Math.random() * 10);
  return left + '+' + right + '=' + (left + right);
}

describe('gru', function() {
  it('can predict what a math problem is after being fed 1000 random math problems', function() {
    console.time('math gru');
    var gru = new GRU({
      inputSize: vocab.characters.length,
      outputSize: vocab.characters.length
    });

    for (var i = 0; i < 10000; i++) {
      gru.run(vocab.toIndexes(randomMath()));
      if (i % 10 === 0) {
        console.log(vocab.toCharacters(gru.predict()).join(''));
      }
    }

    for (i = 0; i < 5; i++) {
      var prediction = vocab.toCharacters(gru.predict());
      assert(/[+]/.test(prediction));
      assert(/[=]/.test(prediction));
    }
    console.timeEnd('math gru');
    console.log('');
  });
});
