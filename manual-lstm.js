import assert from 'assert';
import LSTM from './src/recurrent/lstm';
import { vocab, build, trainUntil } from './test/utilities/math-addition-vocab';

let mathProblems = build();
function runAgainstMath(rnn) {
  var thresh = 0;
  trainUntil(rnn, (out) => {
    var parts = out.split(/[+=]/g);
    if (parts.length !== 3) return;

    if (parseInt(parts[0]) + parseInt(parts[1]) === parseInt(parts[2])) {
      thresh++;
    }

    if (thresh > 100) {
      return true;
    }
  });
  var prediction = vocab.toCharacters(rnn.predict()).join('');
  console.log(prediction);
  assert(/[+]/.test(prediction));
  assert(/[=]/.test(prediction));
}


console.time('math lstm');
var lstm = new LSTM({
  inputSize: 6,
  inputRange: vocab.characters.length,
  outputSize: vocab.characters.length
});

runAgainstMath(lstm);

console.timeEnd('math lstm');
console.log('');
