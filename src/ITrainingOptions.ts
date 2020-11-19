export interface ITrainingOptions {
  iterations: number;
  errorThresh: number;
  log: boolean;
  logPeriod: number;
  learningRate: number;
  momentum: number;
  callback: (iterations: number, error: number) => void;
  callbackPeriod: number;
  timeout: number;
  praxis: any;
  beta1: number;
  beta2: number;
  epsilon: number;
}
