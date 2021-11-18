/** TODO: might need to be extended to include string[][] */
// type Values = string[] | number[] | string;
export type Value = string | number | boolean | string[] | number[] | boolean[];

export interface IRNNDatum {
  input: Value;
  output: Value;
}

export interface ITimeStepObject {
  [key: string]: number | number[];
}

export type TimeStepArray = number[];

export type TimeStepValue = Array<
  number[] | number[][] | ITimeStepObject | ITimeStepObject[] | TimeStepArray
>;

export interface ITimeStepRNNDatum {
  input: TimeStepValue;
  output: TimeStepValue;
}
