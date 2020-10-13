/** TODO: might need to be extended to include string[][] */
// type Values = string[] | number[] | string;
export type Value = string | number | string[] | number[];

export interface IRNNDatum {
  input: Value;
  output: Value;
}
