import assert from 'assert';
import Vocab from '../../../src/utilities/vocab';
import RNN from '../../../src/recurrent/rnn';

describe('rnn.toFunction', () => {
  it('can output same as run method', () => {
    const vocab = new Vocab(['h', 'i', ' ', 'm', 'o', '!']);
    var net = new RNN({
      inputSize: 7,
      inputRange: vocab.characters.length,
      outputSize: 7
    });

    for (var i = 0; i < 100; i++) {
      net.run(vocab.toIndexes('hi mom!'));
      if (i % 10) {
        console.log(vocab.toCharacters(net.predict()).join(''));
      }
    }

    var lastOutput = vocab.toCharacters(net.predict()).join('');
    assert.equal(vocab.toCharacters(net.toFunction()()).join(''), lastOutput);
  });
});