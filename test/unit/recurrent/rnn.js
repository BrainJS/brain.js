var fs = require('fs');
var assert = require('assert');
var RNN = require('../../../lib/recurrent/rnn');
var Vocab = require('../../../lib/recurrent/vocab');
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

describe('rnn', function() {
  describe('#predict', function() {
    context('after being fed 5000 random addition problems', function() {
      it('can predict what a math addition problem is and create one', function() {
        console.time('math rnn');
        var json = new RNN({
          inputSize: 6, //<- length
          inputRange: vocab.characters.length,
          outputSize: vocab.characters.length //<- length
        }).toJSON();

        //1+9=10
        //123456 <- length
        var rnn = new RNN({
          json: json
        });

        runAgainstMath(rnn);
        console.timeEnd('math rnn');
        console.log('');
      });
    });
  });

  describe('#toJSON', function() {
    it('can export model as json', function() {
      var rnn = new RNN({
        inputSize: 6, //<- length
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length //<- length
      });

      var json = rnn.toJSON();
      assert(json.input.rows, vocab.characters.length);
      assert(json.input.columns, 6);
    });
  });

  describe('#fromJSON', function() {
    it('can import model from json', function() {
      var rnn = new RNN({
        inputSize: 6, //<- length
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length //<- length
      });

      runAgainstMath(rnn, true);

      var prediction = vocab.toCharacters(RNN.createFromJSON(rnn.toJSON()).predict()).join('');
      console.log(prediction);
      assert(/[+]/.test(prediction));
      assert(/[=]/.test(prediction));
    });
  });
});