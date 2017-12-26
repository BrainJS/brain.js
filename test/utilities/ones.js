import assert from 'assert';
import ones from '../../src/utilities/ones';

describe('ones', () => {
    it('should return an array with all ones', () => {
        let temp = ones(10);
        console.log(temp);
        let tempCheck = temp.filter((el) => {
            return el === 1;
        });
        assert.ok(temp.length === tempCheck.length);
    })
})