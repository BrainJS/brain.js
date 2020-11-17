import { Value, IRNNDatum } from '../recurrent/rnn-data-types';

export interface IDataFormatter {
  indexTable: { [value: string]: number };
  toIndexesInputOutput: (input: Value, output?: Value) => number[];
  toIndexes: (input: string) => number[];
  toCharacters: (output: number[]) => string[];
  characters: Array<string | number>;
  specialIndexes: number[];
  toFunctionString: () => string;
  formatDataIn: (input?: Value, output?: Value) => number[];
  formatDataOut: (input: number[], output: number[]) => string;
  format: (data: Array<IRNNDatum | Value>) => number[][];
  isSetup: boolean;
}

export class DataFormatter implements IDataFormatter {
  indexTable: { [key: string]: number; [key: number]: number } = {};
  characterTable: { [key: number]: string | number | null } = {};
  characters: Array<string | number> = [];
  specialIndexes: number[] = [];
  isSetup = false;

  constructor(private values?: Array<IRNNDatum | Value>, maxThreshold = 0) {
    if (values === undefined) return;

    this.setup(values, maxThreshold);
  }

  setup(values: Array<IRNNDatum | Value>, maxThreshold = 0): void {
    if (this.isSetup) throw new Error('DataFormatter is already setup');
    this.values = values;
    // go over all characters and keep track of all unique ones seen
    // count up all characters

    this.buildCharactersFromIterable(values);
    this.buildTables(maxThreshold);
    this.isSetup = true;
  }

  buildCharactersFromIterable(values: Array<IRNNDatum | Value>): void {
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
      } else if (typeof characters === 'boolean') {
        const character = characters.toString();
        if (tempCharactersTable.hasOwnProperty(character)) continue;
        tempCharactersTable[dataFormatterIndex] = true;
        this.characters.push(character);
      } else if (
        Array.isArray(characters) &&
        typeof characters[0] === 'string'
      ) {
        for (let i = 0; i < characters.length; i++) {
          const character = characters[i] as string;
          if (tempCharactersTable.hasOwnProperty(character)) continue;
          tempCharactersTable[dataFormatterIndex] = true;
          this.characters.push(character);
        }
      } else if (
        Array.isArray(characters) &&
        (typeof characters[0] === 'number' ||
          typeof characters[0] === 'boolean')
      ) {
        for (let i = 0; i < characters.length; i++) {
          const character = characters[i].toString();
          if (tempCharactersTable.hasOwnProperty(character)) continue;
          tempCharactersTable[dataFormatterIndex] = true;
          this.characters.push(character);
        }
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

    switch (typeof value) {
      case 'number':
      case 'boolean':
        value = value.toString();
    }

    for (let i = 0, max = value.length; i < max; i++) {
      const character = value[i].toString();
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
    let result: number[] = [];
    if (typeof value1 === 'string') {
      result = this.toIndexes(
        value1.split('').concat(['stop-input', 'start-output']),
        maxThreshold
      );
    } else if (typeof value1 === 'number' || typeof value1 === 'boolean') {
      result = this.toIndexes(
        value1.toString().split('').concat(['stop-input', 'start-output']),
        maxThreshold
      );
    } else if (
      typeof (value1 as number[])[0] === 'number' ||
      typeof (value1 as boolean[])[0] === 'boolean'
    ) {
      result = this.toIndexes(
        value1.toString().split('').concat(['stop-input', 'start-output']),
        maxThreshold
      );
    } else {
      throw new Error('unrecognized value');
    }

    if (typeof value2 === 'undefined') return result;

    if (typeof value2 === 'string') {
      return result.concat(this.toIndexes(value2, maxThreshold));
    } else if (typeof value2 === 'number' || typeof value2 === 'boolean') {
      return result.concat(this.toIndexes(value2.toString(), maxThreshold));
    } else if (
      typeof (value2 as number[])[0] === 'number' ||
      typeof (value2 as boolean[])[0] === 'boolean'
    ) {
      return result.concat(
        this.toIndexes(value2.toString().split(''), maxThreshold)
      );
    } else {
      throw new Error('unrecognized value');
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

  static fromAllPrintableInputOutput(
    maxThreshold: number,
    values = ['\n']
  ): DataFormatter {
    const dataFormatter = DataFormatter.fromAllPrintable(maxThreshold, values);
    dataFormatter.addInputOutput();
    dataFormatter.addUnrecognized();
    return dataFormatter;
  }

  static fromStringInputOutput(
    string: string,
    maxThreshold: number
  ): DataFormatter {
    const values = String.prototype.concat(...new Set(string));
    const dataFormatter = new DataFormatter(values.split(''), maxThreshold);
    dataFormatter.addInputOutput();
    dataFormatter.addUnrecognized();
    dataFormatter.isSetup = true;
    return dataFormatter;
  }

  static fromArrayInputOutput(
    data: IRNNDatum[],
    maxThreshold?: number
  ): DataFormatter {
    const values: Array<string | string[]> = [];

    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      values.push(validateAndCast(datum.input), validateAndCast(datum.output));
    }
    const dataFormatter = new DataFormatter(
      values.filter((v, i, a) => a.indexOf(v) === i),
      maxThreshold
    );
    dataFormatter.addInputOutput();
    dataFormatter.addUnrecognized();
    dataFormatter.isSetup = true;
    return dataFormatter;
  }

  static fromString(string: string, maxThreshold: number): DataFormatter {
    const values = String.prototype.concat(...new Set(string));
    return new DataFormatter(values.split(''), maxThreshold);
  }

  /** TODO: Type better, The type of json is not "string that is a valid JSON", it is a POJO in the shape of DataFormatter.
   * this method re-hydrates the the data as an instance of DataFormatter.
   */
  static fromJSON(json: IDataFormatterJSON): DataFormatter {
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

  formatDataIn(input?: Value, output?: Value): number[] {
    if (input === undefined) return [];
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

  format(data: Array<IRNNDatum | Value>): number[][] {
    if (
      typeof data[0] === 'number' &&
      !Array.isArray(data[0]) &&
      (!data[0].hasOwnProperty('input') || !data[0].hasOwnProperty('output'))
    ) {
      return data as number[][];
    }
    const result: number[][] = [];
    if (
      typeof data[0] === 'string' ||
      typeof data[0] === 'number' ||
      Array.isArray(data[0])
    ) {
      if (!this.isSetup) {
        this.setup(data);
        for (let i = 0; i < data.length; i++) {
          result.push(this.formatDataIn(validateAndCast(data[i] as Value)));
        }
        this.addUnrecognized();
      }
      for (let i = 0, max = data.length; i < max; i++) {
        result.push(this.formatDataIn(data[i] as Value));
      }
    } else if ((data[0] as IRNNDatum).input && (data[0] as IRNNDatum).output) {
      if (!this.isSetup) {
        this.setup(data);
      }
      for (let i = 0, max = data.length; i < max; i++) {
        result.push(
          this.formatDataIn(
            validateAndCast((data[i] as IRNNDatum).input),
            validateAndCast((data[i] as IRNNDatum).output)
          )
        );
      }
    } else {
      throw new Error('unrecognized data');
    }
    return result;
  }
}

function validateAndCast(value: Value): string | string[] {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (typeof value[0] === 'string') return value as string[];
  if (typeof value[0] === 'boolean') {
    return (value as boolean[]).map((v: boolean) => v.toString());
  }
  if (typeof value[0] === 'number') {
    return (value as number[]).map((v: number) => v.toString());
  }
  throw new Error(
    'unrecognized value, expected string[], string, number[], number, boolean[], or boolean'
  );
}

export interface IDataFormatterJSON {
  indexTable: { [key: string]: number; [key: number]: number };
  characterTable: { [key: number]: string | number | null };
  values: Value[];
  characters: Array<string | number>;
  specialIndexes: number[];
}
