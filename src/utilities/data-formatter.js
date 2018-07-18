/**
 *
 * @param {String[]|Number[]} values
 * @param maxThreshold
 * @constructor
 */
export default class DataFormatter {
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
    for (let dataFormatterIndex = 0, dataFormatterLength = values.length; dataFormatterIndex < dataFormatterLength; dataFormatterIndex++) {
      let characters = values[dataFormatterIndex];

      if (characters.hasOwnProperty('length')) {
        for (let characterIndex = 0, charactersLength = characters.length; characterIndex < charactersLength; characterIndex++) {
          let character = characters[characterIndex];
          if (tempCharactersTable.hasOwnProperty(character)) continue;
          tempCharactersTable[character] = true;
          this.characters.push(character);
        }
      } else {
        let character = values[dataFormatterIndex];
        if (tempCharactersTable.hasOwnProperty(character)) continue;
        tempCharactersTable[dataFormatterIndex] = true;
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
        // add character to dataFormatter
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
        if (indexTable['unrecognized']) {
          index = indexTable['unrecognized'];
        } else {
          throw new Error(`unrecognized character "${ character }"`);
        }
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
    const result = [];
    const characterTable = this.characterTable;
    const indexTable = this.indexTable;

    for (let i = 0, max = indices.length; i < max; i++) {
      let index = indices[i];
      if (index < maxThreshold) continue;
      let character = characterTable[index];
      if (character === undefined) {
        if (indexTable['unrecognized']) {
          character = characterTable[indexTable['unrecognized']];
        } else {
          throw new Error(`unrecognized index "${ index }"`);
        }
      }
      result.push(character);
    }

    return result;
  }

  toString(indices, maxThreshold) {
    return this.toCharacters(indices, maxThreshold).join('');
  }

  addInputOutput() {
    this.addSpecial('stop-input');
    this.addSpecial('start-output');
  }

  addUnrecognized() {
    this.addSpecial('unrecognized');
  }

  static fromAllPrintable(maxThreshold, values = ['\n']) {
    for(let i = 32; i <= 126; i++) {
      values.push(String.fromCharCode(i));
    }
    return new DataFormatter(values, maxThreshold);
  }

  static fromAllPrintableInputOutput(maxThreshold, values = ['\n']) {
    const dataFormatter = DataFormatter.fromAllPrintable(maxThreshold, values);
    dataFormatter.addInputOutput();
    return dataFormatter;
  }

  static fromStringInputOutput(string, maxThreshold) {
    const values = String.prototype.concat(...new Set(string));
    const dataFormatter = new DataFormatter(values, maxThreshold);
    dataFormatter.addInputOutput();
    return dataFormatter;
  }

  static fromArrayInputOutput(array, maxThreshold) {
    const dataFormatter = new DataFormatter(array.filter((v, i, a) => a.indexOf(v) === i).sort(), maxThreshold);
    dataFormatter.addInputOutput();
    return dataFormatter;
  }

  static fromString(string, maxThreshold) {
    const values = String.prototype.concat(...new Set(string));
    return new DataFormatter(values, maxThreshold);
  }

  static fromJSON(json) {
    const dataFormatter = new DataFormatter();
    dataFormatter.indexTable = json.indexTable;
    dataFormatter.characterTable = json.characterTable;
    dataFormatter.values = json.values;
    dataFormatter.characters = json.characters;
    return dataFormatter;
  }

  addSpecial() {
    for (let i = 0; i < arguments.length; i++) {
      const special = arguments[i];
      let specialIndex = this.indexTable[special] = this.characters.length;
      this.characterTable[specialIndex] = special;
      this.characters.push(special);
    }
  }

  toFunctionString() {
    return `
var characterTable = ${ JSON.stringify(this.characterTable) };
var indexTable = ${ JSON.stringify(this.indexTable) };
var characters = ${ JSON.stringify(this.characters) };
${ this.toIndexes.toString()
      .replace(/(let|var) indexTable = this[.]indexTable;\n/, '')
      .replace(/this[.]/g, '') }
${ this.toIndexesInputOutput.toString().replace(/this[.]/g, '') }
${ this.toCharacters.toString()
      .replace(/(let|var) characterTable = this[.]characterTable;\n/g, '')
      .replace(/this[.]/, '') }
`;
  }
}
