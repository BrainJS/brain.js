import fs from 'fs';
import RNN from '../../src/recurrent/rnn';
import LSTM from '../../src/recurrent/lstm';
import phraseWriterJson from './phrase-writer.json';
var data = initData();

function initData(maxThreshold) {
  maxThreshold = maxThreshold || 0;
  var phrases = phraseWriterJson;
  // go over all characters and keep track of all unique ones seen
  var txt = phrases.join(''); // concat all

  // count up all characters
  var d = {};
  for(var i = 0, n = txt.length; i < n; i++) {
    var txti = txt[i];
    if(txti in d) {
      d[txti] += 1;
    } else {
      d[txti] = 1;
    }
  }

  // filter by count threshold and create pointers
  var characterToIndex = {};
  var indexToCharacter = {};
  var data = [];
  // NOTE: start at one because we will have START and END tokens!
  // that is, START token will be index 0 in model letter vectors
  // and END token will be index 0 in the next character softmax
  var q = 1;
  for(var ch in d) {
    if(d.hasOwnProperty(ch)) {
      if(d[ch] >= maxThreshold) {
        // add character to dataFormatter
        characterToIndex[ch] = q;
        indexToCharacter[q] = ch;
        data.push(ch);
        q++;
      }
    }
  }

  return {
    phrases: phrases,
    characterToIndex: characterToIndex,
    indexToCharacter: indexToCharacter,
    distinct: data.join(''),
    inputSize: data.length + 1,
    outputSize: data.length + 1,
    epochSize: phrases.length
  };
}

function phraseToIndexes(phrase, maxThreshold) {
  maxThreshold = maxThreshold || 0;
  var result = [];
  var characterToIndex = data.characterToIndex;

  for (var i = 0, max = phrase.length; i < max; i++) {
    var character = phrase[i];
    var index = characterToIndex[character];
    if (index < maxThreshold) continue;
    result.push(index);
  }

  return result;
}

function indicesToPhrase(indices, maxThreshold) {
  maxThreshold = maxThreshold || 0;
  var result = [];
  var indexToCharacter = data.indexToCharacter;

  for (var i = 0, max = indices.length; i < max; i++) {
    var index = indices[i];
    if (index < maxThreshold) continue;
    var character = indexToCharacter[index];
    result.push(character);
  }

  return result;
}

function randomPhrase() {
  return data.phrases[Math.floor(Math.random() * data.phrases.length)];
}

describe('character', () => {
  it('', () => {
    return;
    var rnn = new LSTM({
      inputSize: data.inputSize,
      outputSize: data.outputSize
    });

    for (var i = 0; i < 1000; i++) {
      rnn.input(phraseToIndexes(randomPhrase()));
    }

    var prediction = rnn.predict();

    console.log(indicesToPhrase(prediction).join(''));
  });
});