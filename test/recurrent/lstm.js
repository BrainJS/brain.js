import assert from 'assert';
import LSTM from '../../src/recurrent/lstm';
import { vocab, build, train } from '../utilities/math-addition-vocab';

function runAgainstMath(rnn) {
  train(rnn);
  var prediction = vocab.toCharacters(rnn.predict()).join('');
  console.log(prediction);
  assert(/^[0-9]+[+][0-9]+[=][0-9]+$/.test(prediction));
}

describe('lstm', () => {
  describe('math', () => {
    let mathProblems = build();
    it('can predict what a math problem is after being fed 1000 random math problems', () => {
      var lstm = new LSTM({
        inputSize: 6,
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length
      });

      console.time('math lstm');
      runAgainstMath(lstm);
      console.timeEnd('math lstm');
      console.log('');
    });
  });


  describe('#toFunction', () => {
    var lstm = new LSTM({
      inputSize: 6, //<- length
      inputRange: vocab.characters.length,
      outputSize: vocab.characters.length //<- length
    });

    runAgainstMath(lstm);
    //console.log(rnn.toFunction().toString());
    //require('fs').writeFileSync('raw-lstm.js', lstm.toFunction().toString());
  });
});
