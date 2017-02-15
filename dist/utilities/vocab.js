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
    var maxThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, Vocab);

    if (values === undefined) return;

    this.values = values;
    // go over all characters and keep track of all unique ones seen
    // count up all characters
    this.indexTable = {};
    this.characterTable = {};
    this.characters = [];
    this.buildCharactersFromIterable(values);
    this.buildTables(maxThreshold);
  }

  _createClass(Vocab, [{
    key: 'buildCharactersFromIterable',
    value: function buildCharactersFromIterable(values) {
      var tempCharactersTable = {};
      for (var vocabIndex = 0, vocabLength = values.length; vocabIndex < vocabLength; vocabIndex++) {
        var characters = values[vocabIndex];

        if (characters.hasOwnProperty('length')) {
          for (var characterIndex = 0, charactersLength = characters.length; characterIndex < charactersLength; characterIndex++) {
            var character = characters[characterIndex];
            if (tempCharactersTable.hasOwnProperty(character)) continue;
            tempCharactersTable[character] = true;
            this.characters.push(character);
          }
        } else {
          var _character = values[vocabIndex];
          if (tempCharactersTable.hasOwnProperty(_character)) continue;
          tempCharactersTable[vocabIndex] = true;
          this.characters.push(_character);
        }
      }
    }
  }, {
    key: 'buildTables',
    value: function buildTables(maxThreshold) {
      // filter by count threshold and create pointers
      var charactersLength = this.characters.length;
      for (var characterIndex = 0; characterIndex < charactersLength; characterIndex++) {
        var character = this.characters[characterIndex];
        if (characterIndex >= maxThreshold) {
          // add character to vocab
          this.indexTable[character] = characterIndex;
          this.characterTable[characterIndex] = character;
        }
      }
    }
  }, {
    key: 'toIndexes',
    value: function toIndexes(value) {
      var maxThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var result = [];
      var indexTable = this.indexTable;

      for (var i = 0, max = value.length; i < max; i++) {
        var character = value[i];
        var index = indexTable[character];
        if (index === undefined) {
          throw new Error('unrecognized character "' + character + '"');
        }
        if (index < maxThreshold) continue;
        result.push(index);
      }

      return result;
    }
  }, {
    key: 'toIndexesInputOutput',
    value: function toIndexesInputOutput(value1) {
      var value2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var maxThreshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var result = void 0;
      if (typeof value1 === 'string') {
        result = this.toIndexes(value1.split('').concat(['stop-input', 'start-output']), maxThreshold);
      } else {
        result = this.toIndexes(value1.concat(['stop-input', 'start-output']), maxThreshold);
      }

      if (value2 === null) return result;

      if (typeof value2 === 'string') {
        return result.concat(this.toIndexes(value2.split(''), maxThreshold));
      } else {
        return result.concat(this.toIndexes(value2, maxThreshold));
      }
    }
  }, {
    key: 'toCharacters',
    value: function toCharacters(indices) {
      var maxThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var result = [];
      var characterTable = this.characterTable;

      for (var i = 0, max = indices.length; i < max; i++) {
        var index = indices[i];
        if (index < maxThreshold) continue;
        var character = characterTable[index];
        if (character === undefined) {
          throw new Error('unrecognized index "' + index + '"');
        }
        result.push(character);
      }

      return result;
    }
  }, {
    key: 'toString',
    value: function toString(indices, maxThreshold) {
      return this.toCharacters(indices, maxThreshold).join('');
    }
  }, {
    key: 'addInputOutput',
    value: function addInputOutput() {
      this.addSpecial('stop-input');
      this.addSpecial('start-output');
    }
  }, {
    key: 'addSpecial',
    value: function addSpecial() {
      for (var i = 0; i < arguments.length; i++) {
        var special = arguments[i];
        var specialIndex = this.indexTable[special] = this.characters.length;
        this.characterTable[specialIndex] = special;
        this.characters.push(special);
      }
    }
  }, {
    key: 'toFunctionString',
    value: function toFunctionString(vocabVariableName) {
      return '\n' + this.toIndexes.toString().replace('this', vocabVariableName) + '\n' + this.toIndexesInputOutput.toString().replace('this', vocabVariableName) + '\n' + this.toCharacters.toString().replace('this', vocabVariableName) + '\n';
    }
  }], [{
    key: 'fromAllPrintable',
    value: function fromAllPrintable(maxThreshold) {
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['\n'];

      for (var i = 32; i <= 126; i++) {
        values.push(String.fromCharCode(i));
      }
      return new Vocab(values, maxThreshold);
    }
  }, {
    key: 'fromAllPrintableInputOutput',
    value: function fromAllPrintableInputOutput(maxThreshold) {
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['\n'];

      var vocab = Vocab.fromAllPrintable(maxThreshold, values);
      vocab.addInputOutput();
      return vocab;
    }
  }, {
    key: 'fromStringInputOutput',
    value: function fromStringInputOutput(string, maxThreshold) {
      var _String$prototype;

      var values = (_String$prototype = String.prototype).concat.apply(_String$prototype, _toConsumableArray(new Set(string)));
      var vocab = new Vocab(values, maxThreshold);
      vocab.addInputOutput();
      return vocab;
    }
  }, {
    key: 'fromArrayInputOutput',
    value: function fromArrayInputOutput(array, maxThreshold) {
      var vocab = new Vocab(array.filter(function (v, i, a) {
        return a.indexOf(v) === i;
      }).sort(), maxThreshold);
      vocab.addInputOutput();
      return vocab;
    }
  }, {
    key: 'fromString',
    value: function fromString(string, maxThreshold) {
      var _String$prototype2;

      var values = (_String$prototype2 = String.prototype).concat.apply(_String$prototype2, _toConsumableArray(new Set(string)));
      return new Vocab(values, maxThreshold);
    }
  }, {
    key: 'fromJSON',
    value: function fromJSON(json) {
      var vocab = new Vocab();
      vocab.indexTable = json.indexTable;
      vocab.characterTable = json.characterTable;
      vocab.values = json.values;
      vocab.characters = json.characters;
      return vocab;
    }
  }]);

  return Vocab;
}();

exports.default = Vocab;
//# sourceMappingURL=vocab.js.map