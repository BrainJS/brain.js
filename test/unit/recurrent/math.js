var fs = require('fs');
var RNN = require('../../../lib/recurrent/rnn');
var vocabData = initVocab();

function initVocab() {
  var d = ['0','1','2','3','4','5','6','7','8','9','+','='];

  // filter by count threshold and create pointers
  var characterToIndex = {};
  var indexToCharacter = {};
  var vocab = [];
  // NOTE: start at one because we will have START and END tokens!
  // that is, START token will be index 0 in model letter vectors
  // and END token will be index 0 in the next character softmax
  for(var i = 0; i < d.length; i++) {
    var ch = d[i];
    // add character to vocab
    characterToIndex[ch] = i;
    indexToCharacter[i] = ch;
    vocab.push(ch);
  }

  return {
    characterToIndex: characterToIndex,
    indexToCharacter: indexToCharacter,
    distinct: vocab.join(''),
    inputSize: vocab.length + 1,
    outputSize: vocab.length + 1
  };
}

function phraseToIndexes(phrase, maxThreshold) {
  maxThreshold = maxThreshold || 0;
  var result = [];
  var characterToIndex = vocabData.characterToIndex;

  for (var i = 0, max = phrase.length; i < max; i++) {
    var character = phrase[i];
    var index = characterToIndex[character];
    if (index < maxThreshold) continue;
    result.push(index);
  }
  
  return result;
}

function indexesToPhrase(indexes, maxThreshold) {
  maxThreshold = maxThreshold || 0;
  var result = [];
  var indexToCharacter = vocabData.indexToCharacter;

  for (var i = 0, max = indexes.length; i < max; i++) {
    var index = indexes[i];
    if (index < maxThreshold) continue;
    var character = indexToCharacter[index];
    result.push(character);
  }

  return result;
}

function randomMath() {
  return Math.floor(Math.random() * 10) + '+' + Math.floor(Math.random() * 10);
}

describe('character', function() {
  it('', function() {
    var rnn = new RNN({
      inputSize: 11,
      outputSize: 11
    });

    for (var i = 0; i < 1000; i++) {
      rnn.input(phraseToIndexes(randomMath()));
    }

    var prediction = rnn.predict();

    console.log(indexesToPhrase(prediction).join(''));
  });
});