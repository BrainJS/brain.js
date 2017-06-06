import assert from 'assert';
import toArray from '../../src/utilities/to-array';
import zeros from '../../src/utilities/zeros';

describe('toArray', () => {
    it('should return the same array if an array are passed', () => {
        let collection = zeros(10);
        let temp = toArray(collection);
        assert.ok(collection.prototype === temp.prototype);
    });

    it('should return an array if object is passed', () => {
        let collection = {
            name: 'Steve Jobs',
            alive: false
        }

        let temp = toArray(collection);

        assert.ok(Array.isArray(temp));
        assert.ok(temp.length === Object.keys(collection).length);
    })
})
