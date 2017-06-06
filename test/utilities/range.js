import assert from 'assert';
import range from '../../src/utilities/range';

describe('range', () => {
    it('should return an array with elements from start to end(excluded)', () => {
        let start = 1;
        let end = 10;
        let temp = range(start, end);
        assert.ok(temp.length === end - start);
    })
})