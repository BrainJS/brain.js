import Vocab from '../../src/utilities/vocab';
import shuffle from './shuffle';
export const vocab = new Vocab(['0','1','2','3','4','5','6','7','8','9','+','=']);
export function build() {
  let items = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      items.push(`${i}+${j}=${ i + j }`);
      if (i === j) continue;
      items.push(`${j}+${i}=${ i + j }`);
    }
  }
  items.random = function() {
    return items[Math.floor(Math.random() * items.length)];
  };
  return shuffle(items);
}

export function train(rnn) {
  let items = build();
  for (let i = 0, max = items.length; i < max; i++) {
    rnn.run(vocab.toIndexes(items[i]));
    if (i % 10 === 0) {
      //console.log(vocab.toCharacters(rnn.predict()).join(''));
    }
  }
}

export function trainUntil(rnn, fn) {
  let items = build();
  var i = 0;
  while (true) {
    rnn.run(vocab.toIndexes(items.random()));
    if (i % 10 === 0) {
      var preduction = vocab.toCharacters(rnn.predict()).join('');
      //console.log(preduction);
      if (fn(preduction)) {
        break;
      }
    }
    i++;
  }
}