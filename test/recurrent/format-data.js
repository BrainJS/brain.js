import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import Vocab from '../../src/utilities/vocab';
import rnnCheck from '../utilities/rnn-check';


      const vocab = new Vocab([' ', 'h', 'i', 'm', 'o', 'd', 'a', '!']);
      vocab.addSpecial('BREAK');
      var net = new RNN({
        inputSize: 9,
        inputRange: vocab.characters.length,
        outputSize: 9,
        vocab: vocab
      });
      net.train([
        {
          input: 'hi ',
          output: 'mom!'
        }, {
          input: 'hi ',
          output: 'dad!'
        }
      ]);

console.log(net.run('hi m'));
