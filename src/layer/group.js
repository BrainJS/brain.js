import Base from './base';

export default class Group extends Base {
  constructor() {
    super();


  }

  setNextLayer(nextLayer) {
    this.nextLayer = nextLayer;
  }

  setPreviousLayer(previousLayer) {
    this.previousLayer = previousLayer;
  }
}