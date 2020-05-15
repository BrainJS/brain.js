/**
 *
 * @param {String[]|Number[]} values
 * @param maxThreshold
 * @constructor
 */
class DataFormatter {
  constructor(values, maxThreshold = 0) {
    if (values === undefined) return;

    this.values = values;
    // go over all characters and keep track of all unique ones seen
    // count up all characters
    this.indexTable = {};
    this.characterTable = {};
    this.characters = [];
    this.specialIndexes = [];
    this.buildCharactersFromIterable(values);
    this.buildTables(maxThreshold);
  }

  buildCharactersFromIterable(values) {
    const tempCharactersTable = {};
    for (
      let dataFormatterIndex = 0, dataFormatterLength = values.length;
      dataFormatterIndex < dataFormatterLength;
      dataFormatterIndex++
    ) {
      const characters = values[dataFormatterIndex];

      if (characters.hasOwnProperty('length')) {
        for (
          let characterIndex = 0, charactersLength = characters.length;
          characterIndex < charactersLength;
          characterIndex++
        ) {
          const character = characters[characterIndex];
          if (tempCharactersTable.hasOwnProperty(character)) continue;
          tempCharactersTable[character] = true;
          this.characters.push(character);
        }
      } else {
        const character = values[dataFormatterIndex];
        if (tempCharactersTable.hasOwnProperty(character)) continue;
        tempCharactersTable[dataFormatterIndex] = true;
        this.characters.push(character);
      }
    }
  }

  buildTables(maxThreshold) {
    // filter by count threshold and create pointers
    const charactersLength = this.characters.length;
    for (
      let characterIndex = 0;
      characterIndex < charactersLength;
      characterIndex++
    ) {
      const character = this.characters[characterIndex];
      if (characterIndex >= maxThreshold) {
        // add character to dataFormatter
        this.indexTable[character] = characterIndex;
        this.characterTable[characterIndex] = character;
      }
    }
  }

  toIndexes(value, maxThreshold = 0) {
    const result = [];
    const { indexTable } = this;

    for (let i = 0, max = value.length; i < max; i++) {
      const character = value[i];
      let index = indexTable[character];
      if (index === undefined) {
        if (indexTable.unrecognized) {
          index = indexTable.unrecognized;
        } else {
          throw new Error(`unrecognized character "${character}"`);
        }
      }
      if (index < maxThreshold) continue;
      result.push(index);
    }
    return result;
  }

  toIndexesInputOutput(value1, value2 = null, maxThreshold = 0) {
    let result = null;
    if (typeof value1 === 'string') {
      result = this.toIndexes(
        value1.split('').concat(['stop-input', 'start-output']),
        maxThreshold
      );
    } else if (typeof value1 === 'number') {
      result = this.toIndexes(
        value1.toString().split('').concat(['stop-input', 'start-output']),
        maxThreshold
      );
    } else {
      result = this.toIndexes(
        value1.concat(['stop-input', 'start-output']),
        maxThreshold
      );
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
    const { indexTable, characterTable } = this;

    for (let i = 0, max = indices.length; i < max; i++) {
      const index = indices[i];
      if (index < maxThreshold) continue;
      let character = characterTable[index];
      if (character === undefined) {
        if (indexTable.unrecognized) {
          character = characterTable[indexTable.unrecognized];
        } else {
          throw new Error(`unrecognized index "${index}"`);
        }
      } else if (character !== null) {
        result.push(character);
      }
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
    for (let i = 32; i <= 126; i++) {
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
    const dataFormatter = new DataFormatter(
      array.filter((v, i, a) => a.indexOf(v) === i),
      maxThreshold
    );
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
    dataFormatter.specialIndexes = json.specialIndexes;
    return dataFormatter;
  }

  addSpecial(special, character = null) {
    const specialIndex = (this.indexTable[special] = this.characters.length);
    this.characterTable[specialIndex] = character;
    this.specialIndexes.push(this.characters.length);
    this.characters.push(special);
  }

  countSpecial(output) {
    let sum = 0;
    for (let i = 0; i < this.specialIndexes; i++) {
      let index = -1;
      while ((index = output.indexOf(this.specialIndexes[i], index) > -1)) {
        sum++;
      }
    }
    return sum;
  }

  toFunctionString() {
    return `
var characterTable = ${JSON.stringify(this.characterTable)};
var indexTable = ${JSON.stringify(this.indexTable)};
var characters = ${JSON.stringify(this.characters)};
var dataFormatter = {
  ${this.toIndexes.toString()},
  ${this.toIndexesInputOutput.toString()},
  ${this.toCharacters.toString()}
};`;
  }
}

function validateAndCast(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value[0] === 'string') return value;
  if (typeof value[0] === 'number') {
    return value.map((value) => value.toString());
  }
  throw new Error(
    'unrecognized value, expected string[], string, number[], or number'
  );
}

/**
 *
 * @param {*[]} data
 * @returns {Number[]}
 */
function defaultRNNFormatter(data) {
  if (
    typeof data[0] !== 'string' &&
    !Array.isArray(data[0]) &&
    (!data[0].hasOwnProperty('input') || !data[0].hasOwnProperty('output'))
  ) {
    return data;
  }
  const values = [];
  const result = [];
  if (
    typeof data[0] === 'string' ||
    typeof data[0] === 'number' ||
    Array.isArray(data[0])
  ) {
    if (!this.dataFormatter) {
      for (let i = 0; i < data.length; i++) {
        values.push(validateAndCast(data[i]));
      }
      this.dataFormatter = new DataFormatter(values);
      this.dataFormatter.addUnrecognized();
    }
    for (let i = 0, max = data.length; i < max; i++) {
      result.push(this.formatDataIn(data[i]));
    }
  } else if (data[0].input && data[0].output) {
    if (!this.dataFormatter) {
      for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        values.push(
          validateAndCast(datum.input),
          validateAndCast(datum.output)
        );
      }
      this.dataFormatter = DataFormatter.fromArrayInputOutput(values);
      this.dataFormatter.addUnrecognized();
    }
    for (let i = 0, max = data.length; i < max; i++) {
      result.push(
        this.formatDataIn(
          validateAndCast(data[i].input),
          validateAndCast(data[i].output)
        )
      );
    }
  } else {
    throw new Error('unrecognized data');
  }
  return result;
}

module.exports = { DataFormatter, defaultRNNFormatter };
