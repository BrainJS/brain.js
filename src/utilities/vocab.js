/**
 *
 * @param {String[]|Number[]} values
 * @param maxThreshold
 * @constructor
 */
export default class Vocab {
  constructor(values, maxThreshold = 0) {
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

  buildCharactersFromIterable(values) {
    let tempCharactersTable = {};
    for (let vocabIndex = 0, vocabLength = values.length; vocabIndex < vocabLength; vocabIndex++) {
      let characters = values[vocabIndex];

      if (characters.hasOwnProperty('length')) {
        for (let characterIndex = 0, charactersLength = characters.length; characterIndex < charactersLength; characterIndex++) {
          let character = characters[characterIndex];
          if (tempCharactersTable.hasOwnProperty(character)) continue;
          tempCharactersTable[character] = true;
          this.characters.push(character);
        }
      } else {
        let character = values[vocabIndex];
        if (tempCharactersTable.hasOwnProperty(character)) continue;
        tempCharactersTable[vocabIndex] = true;
        this.characters.push(character);
      }
    }
  }

  buildTables(maxThreshold) {
    // filter by count threshold and create pointers
    let charactersLength = this.characters.length;
    for(let characterIndex = 0; characterIndex < charactersLength; characterIndex++) {
      let character = this.characters[characterIndex];
      if(characterIndex >= maxThreshold) {
        // add character to vocab
        this.indexTable[character] = characterIndex;
        this.characterTable[characterIndex] = character;
      }
    }
  }

  toIndexes(value, maxThreshold = 0) {
    let result = [];
    let indexTable = this.indexTable;

    for (let i = 0, max = value.length; i < max; i++) {
      let character = value[i];
      let index = indexTable[character];
      if (index === undefined) {
        throw new Error(`unrecognized character "${ character }"`);
      }
      if (index < maxThreshold) continue;
      result.push(index);
    }

    return result;
  }

  toIndexesInputOutput(value1, value2 = null, maxThreshold = 0) {
    let result;
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

  toCharacters(indices, maxThreshold = 0) {
    let result = [];
    let characterTable = this.characterTable;

    for (let i = 0, max = indices.length; i < max; i++) {
      let index = indices[i];
      if (index < maxThreshold) continue;
      let character = characterTable[index];
      if (character === undefined) {
        throw new Error(`unrecognized index "${ index }"`);
      }
      result.push(character);
    }

    return result;
  }

  toString(indices, maxThreshold) {
    return this.toCharacters(indices, maxThreshold).join('');
  }

  static allPrintable(maxThreshold, values = ['\n']) {
    for(let i = 32; i <= 126; i++) {
      values.push(String.fromCharCode(i));
    }
    return new Vocab(values, maxThreshold);
  }

  static allPrintableInputOutput(maxThreshold, values = ['\n']) {
    const vocab = Vocab.allPrintable(maxThreshold, values);
    vocab.addSpecial('stop-input');
    vocab.addSpecial('start-output');
    return vocab;
  }

  static fromStringInputOutput(string, maxThreshold) {
    const values = String.prototype.concat(...new Set(string));
    const vocab = new Vocab(values, maxThreshold);
    vocab.addSpecial('stop-input');
    vocab.addSpecial('start-output');
    return vocab;
  }

  static fromArrayInputOutput(array, maxThreshold) {
    const vocab = new Vocab(array.filter((v, i, a) => a.indexOf(v) === i).sort(), maxThreshold);
    vocab.addSpecial('stop-input');
    vocab.addSpecial('start-output');
    return vocab;
  }

  static fromString(string, maxThreshold) {
    const values = String.prototype.concat(...new Set(string));
    return new Vocab(values, maxThreshold);
  }

  static fromJSON(json) {
    const vocab = new Vocab();
    vocab.indexTable = json.indexTable;
    vocab.characterTable = json.characterTable;
    vocab.values = json.values;
    vocab.characters = json.characters;
    return vocab;
  }

  addSpecial(special) {
    let i = this.indexTable[special] = this.characters.length;
    this.characterTable[i] = special;
    this.characters.push(special);
  }

  toFunctionString(vocabVariableName) {
    return `
${ this.toIndexes.toString().replace('this', vocabVariableName) }
${ this.toIndexesInputOutput.toString().replace('this', vocabVariableName) }
${ this.toCharacters.toString().replace('this', vocabVariableName) }
`;
  }
}
