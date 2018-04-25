import { Range } from './../../../app/gitlab/model/range';
import * as assert from 'assert';

describe('Range', () => {
    let range: Range;
    beforeEach(() => {
        range = new Range(10, 20);
    });
    it('isInside()', () => {
        assert(range.isInside(9) === false);
        assert(range.isInside(10) === true);
        assert(range.isInside(20) === true);
        assert(range.isInside(21) === false);
    });
});
