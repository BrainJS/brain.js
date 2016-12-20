import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import LSTM from '../../src/recurrent/lstm';
import Vocab from '../../src/utilities/vocab';
import rnnCheck from '../utilities/rnn-check';
const vocab = Vocab.allPrintableSeparated();
var net = new LSTM({
  vocab: vocab
});
net.train([
  {
    input: 'hi',
    output: 'mom!'
  }, {
    input: 'hello',
    output: 'dad!'
  }
]);

console.log(net.run('hi'));
console.log(net.run('hello'));
