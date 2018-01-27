import assert from 'assert';
 import toArray from '../../src/utilities/to-array';
 import zeros from '../../src/utilities/zeros';
 
describe('toArray', () => {
  it('should return the same array if an array are passed', () => {
    const collection = zeros(10);
    const temp = toArray(collection);
    assert.ok(collection.prototype === temp.prototype);
  });

  it('should return an array if object is passed', () => {
    const collection = {
      name: 'Steve Jobs',
      alive: false
    };

    const temp = toArray(collection);
    assert.ok(temp.constructor === Float32Array);
    assert.ok(temp.length === Object.keys(collection).length);
  });
});