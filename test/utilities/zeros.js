import assert from 'assert';
import zeros from '../../src/utilities/zeros';

describe('zeros', () => {
    it('should return an array with all zeros', () => {
        let temp = zeros(10);
        let tempCheck = temp.filter((el) => {
            return el === 0;
        });
        assert.ok(temp.length === tempCheck.length);
    })
})