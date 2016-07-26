var fs = require('fs');
var RNN = require('../../../lib/recurrent/rnn');
var phraseWriterJson = require('./phrase-writer.json');
function initVocab(srcJson, count_threshold) {
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
  var letterToIndex = {};
  var indexToLetter = {};
  var vocab = [];
  // NOTE: start at one because we will have START and END tokens!
  // that is, START token will be index 0 in model letter vectors
  // and END token will be index 0 in the next character softmax
  var q = 1;
  for(ch in d) {
    if(d.hasOwnProperty(ch)) {
      if(d[ch] >= count_threshold) {
        // add character to vocab
        letterToIndex[ch] = q;
        indexToLetter[q] = ch;
        vocab.push(ch);
        q++;
      }
    }
  }

  return {
    phrases: phrases,
    //phrasesAs
    distinct: vocab.join(''),
    inputSize: vocab.length + 1,
    outputSize: vocab.length + 1,
    epochSize: phrases.length
  };
}

describe('character', function() {
  it('', function() {
    var vocabData = initVocab();
    var randomPhrase = vocabData.phrases[Math.floor(Math.random() * vocabData.phrases.length)];
    var rnn = new RNN();
    rnn
      .input([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
      .step();
  });
});