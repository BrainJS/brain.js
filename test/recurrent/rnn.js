import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import Vocab from '../../src/utilities/vocab';
var vocab = new Vocab(['0','1','2','3','4','5','6','7','8','9','+','=']);

function randomMath() {
  var left = Math.floor(Math.random() * 10);
  var right = Math.floor(Math.random() * 10);
  return left + '+' + right + '=' + (left + right);
}

function runAgainstMath(rnn) {
  for (var i = 0; i < 1000; i++) {
    rnn.run(vocab.toIndexes(randomMath()));
    if (i % 10 === 0) {
      //console.log(vocab.toCharacters(rnn.predict()).join(''));
    }
  }

  var prediction = vocab.toCharacters(rnn.predict()).join('');
  console.log(prediction);
  assert(/[+]/.test(prediction));
  assert(/[=]/.test(prediction));
}

describe('rnn', function() {
  describe('#predict', function() {
    context('after being fed 1000 random addition problems', function() {
      it('can predict what a math addition problem is and create one', function() {
        console.time('math rnn');
        var rnn = new RNN({
          inputSize: 6, //<- length
          inputRange: vocab.characters.length,
          outputSize: vocab.characters.length //<- length
        });

        runAgainstMath(rnn);
        console.timeEnd('math rnn');
        console.log('');
      });
    });
  });

  /*describe('#train', function() {
    it('can train', function() {
      var rnn = new RNN({
        inputSize: 6, //<- length
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length //<- length
      });

      runAgainstMath(rnn, true);

      rnn.train([{input: [0, 0], output: [0]},
        {input: [0, 1], output: [1]},
        {input: [1, 0], output: [1]},
        {input: [1, 1], output: [0]}]);
    });
  });*/
});