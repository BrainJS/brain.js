import { BaseLayer } from './base-layer';

export { Activation } from './activation';
export { Filter } from './filter';
export { Internal } from './internal';
export { Modifier } from './modifier';
export { Operator } from './operator';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class InternalModel {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EntryPoint extends BaseLayer {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Model extends BaseLayer {}
