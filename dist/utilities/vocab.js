'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 * @param {String[]|Number[]} values
 * @param maxThreshold
 * @constructor
 */
var Vocab = function () {
  function Vocab(values) {
    var maxThreshold = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    _classCallCheck(this, Vocab);

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
        this.indexTable[_character] = _characterIndex;
        this.characterTable[_characterIndex] = _character;
      }
    }
  }

  _createClass(Vocab, [{
    key: 'toIndexes',
    value: function toIndexes(phrase) {
      var maxThreshold = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      var result = [];
      var indexTable = this.indexTable;

      for (var i = 0, max = phrase.length; i < max; i++) {
        var character = phrase[i];
        var index = indexTable[character];
        if (typeof index === 'undefined') {
          throw new Error('unrecognized character "' + character + '"');
        }
        if (index < maxThreshold) continue;
        result.push(index);
      }

      return result;
    }
  }, {
    key: 'toCharacters',
    value: function toCharacters(indexes) {
      var maxThreshold = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      var result = [];
      var characterTable = this.characterTable;

      for (var i = 0, max = indexes.length; i < max; i++) {
        var index = indexes[i];
        if (index < maxThreshold) continue;
        var character = characterTable[index];
        if (typeof character === 'undefined') {
          throw new Error('unrecognized index "' + index + '"');
        }
        result.push(character);
      }

      return result;
    }
  }, {
    key: 'toString',
    value: function toString(indexes, maxThreshold) {
      return this.toCharacters(indexes, maxThreshold).join('');
    }
  }], [{
    key: 'allPrintable',
    value: function allPrintable(maxThreshold) {
      var values = [];
      for (var i = 32; i <= 126; i++) {
        values.push(String.fromCharCode(i));
      }
      return new Vocab(values, maxThreshold);
    }
  }, {
    key: 'fromString',
    value: function fromString(string, maxThreshold) {
      var _String$prototype;

      var values = (_String$prototype = String.prototype).concat.apply(_String$prototype, _toConsumableArray(new Set(string)));
      return new Vocab(values, maxThreshold);
    }
  }]);

  return Vocab;
}();

exports.default = Vocab;
//# sourceMappingURL=vocab.js.map