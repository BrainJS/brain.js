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
  describe('math', function() {
    it('can predict what a math problem is after being fed 1000 random math problems', function() {
      var rnn = new RNN({
        inputSize: vocab.characters.length + 1,
        outputSize: vocab.characters.length + 1,
        vocab: vocab
      });

      for (var i = 0; i < 1000; i++) {
        rnn.inputVocab(randomMath());
      }

      for (i = 0; i < 5; i++) {
        var prediction = rnn.predictVocab();
        assert(/[+]/.test(prediction));
        assert(/[=]/.test(prediction));
      }
    });
  });
});