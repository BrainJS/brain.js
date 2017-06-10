import assert from 'assert';
import randos from '../../src/utilities/randos';

describe('randos', () => {
    it('should return an array of finite random weights', () => {
        let temp = randos(10);
        let tempCheck = temp.filter((el) => {
            return Number.isFinite(el);
        });
        assert.ok(temp.length === tempCheck.length);
    })
})