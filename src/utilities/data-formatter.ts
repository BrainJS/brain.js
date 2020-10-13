import { Value, IRNNDatum } from '../recurrent/rnn-data-types';

export interface IDataFormatter<IOType> {
  indexTable: { [value: string]: number };
  toIndexesInputOutput: (input: IOType, output?: IOType) => number[];
  toIndexes: (input: IOType) => number[];
  toCharacters: (output: number[]) => string[];
  characters: Array<string | number>;
  specialIndexes: number[];
  toFunctionString: () => string;
  formatDataIn: (
    input: Value | IRNNDatum | null,
    output?: Value | IRNNDatum
  ) => number[];
  formatDataOut: (input: number[], output: number[]) => string;
  isSetup: boolean;
}

export class DataFormatter<IOType> implements IDataFormatter<IOType> {
  indexTable: { [key: string]: number; [key: number]: number } = {};
  characterTable: { [key: number]: string | number | null } = {};
  characters: Array<string | number> = [];
  specialIndexes: number[] = [];
  isSetup = false;

  constructor(private values?: Value[], maxThreshold = 0) {
    if (values === undefined) return;

    this.values = values;
    // go over all characters and keep track of all unique ones seen
    // count up all characters

    this.buildCharactersFromIterable(values);
    this.buildTables(maxThreshold);
  }

  buildCharactersFromIterable(values: Value[]): void {
    const tempCharactersTable: { [character: string]: boolean } = {};
    for (
      let dataFormatterIndex = 0, dataFormatterLength = values.length;
      dataFormatterIndex < dataFormatterLength;
      dataFormatterIndex++
    ) {
      const characters = values[dataFormatterIndex];

      if (characters.hasOwnProperty('length')) {
        const iteratable = characters as string[] | string;
        for (
          let characterIndex = 0, charactersLength = iteratable.length;
          characterIndex < charactersLength;
          characterIndex++
        ) {
          const character = iteratable[characterIndex];
          if (tempCharactersTable.hasOwnProperty(character)) continue;
          tempCharactersTable[character] = true;
          this.characters.push(character);
        }
      } else if (typeof characters === 'number') {
        if (tempCharactersTable.hasOwnProperty(characters)) continue;
        tempCharactersTable[dataFormatterIndex] = true;
        this.characters.push(characters);
      } else {
        //  remove check after TS conversion is complete
        throw new Error('Should never happen');
      }
    }
  }

  buildTables(maxThreshold: number): void {
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

  toIndexes(value: Value, maxThreshold = 0): number[] {
    const result = [];
    const { indexTable } = this;

    if (typeof value === 'number') value = value.toString();

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

  toIndexesInputOutput(
    value1: Value,
    value2?: Value,
    maxThreshold = 0
  ): number[] {
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
    } else if (Array.isArray(value1)) {
      result = this.toIndexes(
        value1.concat(['stop-input', 'start-output']),
        maxThreshold
      );
    }

    if (typeof value2 === 'undefined') return result;

    if (typeof value2 === 'string') {
      return result.concat(this.toIndexes(value2.split(''), maxThreshold));
    } else {
      return result.concat(this.toIndexes(value2, maxThreshold));
    }
  }

  toCharacters(indices: number[], maxThreshold = 0): string[] {
    const result: string[] = [];
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
        result.push(character.toString());
      }
    }

    return result;
  }

  toString(indices: number[], maxThreshold: number): string {
    return this.toCharacters(indices, maxThreshold).join('');
  }

  addInputOutput(): void {
    this.addSpecial('stop-input');
    this.addSpecial('start-output');
  }

  addUnrecognized(): void {
    this.addSpecial('unrecognized');
  }

  static fromAllPrintable(
    maxThreshold: number,
    values = ['\n']
  ): DataFormatter {
    for (let i = 32; i <= 126; i++) {
      values.push(String.fromCharCode(i));
    }
    return new DataFormatter(values, maxThreshold);
  }

  static fromAllPrintableInputOutput<IOType>(
    maxThreshold: number,
    values = ['\n']
  ): DataFormatter<IOType> {
    const dataFormatter = DataFormatter.fromAllPrintable(maxThreshold, values);
    dataFormatter.addInputOutput();
    dataFormatter.addUnrecognized();
    return dataFormatter;
  }

  static fromStringInputOutput<IOType>(
    string: string,
    maxThreshold: number
  ): DataFormatter<IOType> {
    const values = String.prototype.concat(...new Set(string));
    const dataFormatter = new DataFormatter<IOType>(
      values.split(''),
      maxThreshold
    );
    dataFormatter.addInputOutput();
    dataFormatter.addUnrecognized();
    dataFormatter.isSetup = true;
    return dataFormatter;
  }

  static fromArrayInputOutput<IOType extends IRNNDatum>(
    data: IOType[],
    maxThreshold?: number
  ): DataFormatter<IOType> {
    const values: Array<string | string[]> = [];

    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      values.push(validateAndCast(datum.input), validateAndCast(datum.output));
    }
    const dataFormatter = new DataFormatter<IOType>(
      values.filter((v, i, a) => a.indexOf(v) === i),
      maxThreshold
    );
    dataFormatter.addInputOutput();
    dataFormatter.addUnrecognized();
    dataFormatter.isSetup = true;
    return dataFormatter;
  }

  static fromString<IOType>(
    string: string,
    maxThreshold: number
  ): DataFormatter<IOType> {
    const values = String.prototype.concat(...new Set(string));
    return new DataFormatter(values.split(''), maxThreshold);
  }

  /** TODO: Type better, The type of json is not "string that is a valid JSON", it is a POJO in the shape of DataFormatter.
   * this method re-hydrates the the data as an instance of DataFormatter.
   */
  static fromJSON<IOType>(json: IDataFormatterJSON): DataFormatter<IOType> {
    const dataFormatter = new DataFormatter();
    dataFormatter.indexTable = json.indexTable;
    dataFormatter.characterTable = json.characterTable;
    dataFormatter.values = json.values;
    dataFormatter.characters = json.characters;
    dataFormatter.specialIndexes = json.specialIndexes;
    return dataFormatter;
  }

  addSpecial(special: string | number, character = null): void {
    const specialIndex = (this.indexTable[special] = this.characters.length);
    this.characterTable[specialIndex] = character;
    this.specialIndexes.push(this.characters.length);
    this.characters.push(special);
  }

  toFunctionString(): string {
    return `
var characterTable = ${JSON.stringify(this.characterTable)};
var indexTable = ${JSON.stringify(this.indexTable)};
var characters = ${JSON.stringify(this.characters)};
var dataFormatter = {
  toIndexes: ${this.toIndexes.toString()},
  toIndexesInputOutput: ${this.toIndexesInputOutput.toString()},
  toCharacters: ${this.toCharacters.toString()},
};`;
  }

  formatDataIn(
    input: Value | IRNNDatum | null,
    output?: Value | IRNNDatum
  ): number[] {
    if (!input) return [];
    if (Array.isArray(input) && typeof input[0] === 'number') {
      return input as number[];
    }
    if (this.indexTable.hasOwnProperty('stop-input')) {
      return this.toIndexesInputOutput(input, output);
    }
    return this.toIndexes(input);
  }

  formatDataOut(input: number[], output: number[]): string {
    return this.toCharacters(output).join('');
  }

  format(data: Array<IRNNDatum | Value>): string[] {
    if (
      typeof data[0] !== 'string' &&
      !Array.isArray(data[0]) &&
      (!data[0].hasOwnProperty('input') || !data[0].hasOwnProperty('output'))
    ) {
      return data;
    }
    const values: any[] = [];
    const result = [];
    if (
      typeof data[0] === 'string' ||
      typeof data[0] === 'number' ||
      Array.isArray(data[0])
    ) {
      if (!this.isSetup) {
        for (let i = 0; i < data.length; i++) {
          values.push(validateAndCast(data[i]));
        }
        this.addUnrecognized();
        this.isSetup = true;
      }
      for (let i = 0, max = data.length; i < max; i++) {
        result.push(this.formatDataIn(data[i]));
      }
    } else if (data[0].input && data[0].output) {
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
}

function validateAndCast(
  value: string | number | string[] | number[]
): string | string[] {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value[0] === 'string') return value as string[];
  if (typeof value[0] === 'number') {
    return (value as number[]).map((v: number) => v.toString());
  }
  throw new Error(
    'unrecognized value, expected string[], string, number[], or number'
  );
}

export interface IDataFormatterJSON {
  indexTable: { [key: string]: number; [key: number]: number };
  characterTable: { [key: number]: string | number | null };
  values: Value[];
  characters: Array<string | number>;
  specialIndexes: number[];
}
