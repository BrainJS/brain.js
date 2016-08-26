var fs = require('fs');
var assert = require('assert');
var RNN = require('../../../lib/recurrent/rnn');
var Vocab = require('../../../lib/recurrent/vocab');
var vocab = new Vocab(['0','1','2','3','4','5','6','7','8','9','+','=', '-', '/', '*']);

function randomMath() {
  var left = Math.floor(Math.random() * 10);
  var right = Math.floor(Math.random() * 10);
  return left + '+' + right + '=' + (left + right);
}

describe('rnn', function() {
  it('can predict what a math problem is after being fed 1000 random math problems', function() {
    console.time('math rnn');
    var rnn = new RNN({
      inputSize: vocab.characters.length,
      outputSize: vocab.characters.length
    });

    for (var i = 0; i < 1000; i++) {
      rnn.run(vocab.toIndexes(randomMath()));
    }

    for (i = 0; i < 5; i++) {
      var prediction = vocab.toCharacters(rnn.predict());
      assert(/[+]/.test(prediction));
      assert(/[=]/.test(prediction));
    }
    console.timeEnd('math rnn');
    console.log('');
  });
});