import assert from 'assert';
import LSTM from '../../src/recurrent/lstm';
import Vocab from '../../src/utilities/vocab';
import { vocab, build, train } from '../utilities/math-addition-vocab';

function runAgainstMath(rnn) {
  train(rnn);
  var prediction = vocab.toCharacters(rnn.run()).join('');
  console.log(prediction);
  assert(/^[0-9]+[+][0-9]+[=][0-9]+$/.test(prediction));
}

describe('lstm', () => {
  describe('math', () => {
    it('can predict what a math problem is after being fed 1000 random math problems', () => {
      var net = new LSTM({
        inputSize: 6,
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length
      });
      runAgainstMath(net);
    });
  });

  describe('.toFunction', () => {
    it('can output same as run method', () => {
      const vocab = new Vocab(['h', 'i', ' ', 'm', 'o', '!']);
      var net = new LSTM({
        inputSize: 7,
        inputRange: vocab.characters.length,
        outputSize: 7
      });

      for (var i = 0; i < 100; i++) {
        net.trainPattern(vocab.toIndexes('hi mom!'));
        if (i % 10) {
          console.log(vocab.toCharacters(net.run()).join(''));
        }
      }

      var lastOutput = vocab.toCharacters(net.run()).join('');
      assert.equal(vocab.toCharacters(net.toFunction()()).join(''), lastOutput);
    });
  });
});
