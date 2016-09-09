"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 * @param {String[]|Number[]} values
 * @param maxThreshold
 * @constructor
 */
var Vocab = function () {
  function Vocab(values, maxThreshold) {
    _classCallCheck(this, Vocab);

    maxThreshold = maxThreshold || 0;
    this.values = values;
    // go over all characters and keep track of all unique ones seen
    // count up all characters
    this.indexTable = {};
    this.characterTable = {};
    this.characters = [];
    var tempCharactersTable = {};
    for (var vocabIndex = 0, vocabLength = values.length; vocabIndex < vocabLength; vocabIndex++) {
      var characters = values[vocabIndex].toString();
      for (var characterIndex = 0, _charactersLength = characters.length; characterIndex < _charactersLength; characterIndex++) {
        var character = characters[characterIndex];
        if (character in tempCharactersTable) continue;
        tempCharactersTable[character] = true;
        this.characters.push(character);
      }
    }

    // filter by count threshold and create pointers

    // NOTE: start at one because we will have START and END tokens!
    // that is, START token will be index 0 in model letter vectors
    // and END token will be index 0 in the next character softmax
    var charactersLength = this.characters.length;
    for (var _characterIndex = 0; _characterIndex < charactersLength; _characterIndex++) {
      var _character = this.characters[_characterIndex];
      if (_characterIndex >= maxThreshold) {
        // add character to vocab
        this.indexTable[_character] = _characterIndex + 1;
        this.characterTable[_characterIndex + 1] = _character;
      }
    }
  }

  _createClass(Vocab, [{
    key: "toIndexes",
    value: function toIndexes(phrase, maxThreshold) {
      maxThreshold = maxThreshold || 0;
      var result = [];
      var indexTable = this.indexTable;

      for (var i = 0, max = phrase.length; i < max; i++) {
        var character = phrase[i];
        var index = indexTable[character];
        if (index < maxThreshold) continue;
        result.push(index);
      }

      return result;
    }
  }, {
    key: "toCharacters",
    value: function toCharacters(indexes, maxThreshold) {
      maxThreshold = maxThreshold || 0;
      var result = [];
      var characterTable = this.characterTable;

      for (var i = 0, max = indexes.length; i < max; i++) {
        var index = indexes[i];
        if (index < maxThreshold) continue;
        var character = characterTable[index];
        result.push(character);
      }

      return result;
    }
  }]);

  return Vocab;
}();

exports.default = Vocab;
//# sourceMappingURL=vocab.js.map