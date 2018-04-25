import { DiffInfoBuilder, DiffInfo } from './../../../app/gitlab/model/diff-info';
import { Range } from '../../../app/gitlab/model/range';
import * as fs from 'fs';
import * as assert from 'assert';

describe('DiffInfo', () => {
    let diffInfo: DiffInfo;
    describe('Getter', () => {
        it('getPath()', () => {
            diffInfo = new DiffInfoTestBuilder('path string', [new Range(11, 22)]).build();
            assert(diffInfo.getPath() === 'path string');
        });
        it('getRange()', () => {
            diffInfo = new DiffInfoTestBuilder('path string', [new Range(11, 22)]).build();
            assert(JSON.stringify(diffInfo.getRanges()[0]) === '{"begin":11,"end":22}');
        });
    });
    describe('isModifiedLine()', () => {
        it('Rangeが存在する場合', () => {
            diffInfo = new DiffInfoTestBuilder('path string', [new Range(11, 22)]).build();
            assert(diffInfo.isModifiedLine(10) === false);
            assert(diffInfo.isModifiedLine(11) === true);
            assert(diffInfo.isModifiedLine(22) === true);
            assert(diffInfo.isModifiedLine(23) === false);
        });
        it('Rangeが存在しない場合', () => {
            diffInfo = new DiffInfoTestBuilder('path string', []).build();
            assert(diffInfo.isModifiedLine(10) === false);
        });
    });

    class DiffInfoTestBuilder extends DiffInfoBuilder {
        constructor(public path: string, public ranges: Range[]) {
            super();
        }
        public build(): DiffInfo {
            return new DiffInfo(this);
        }
    }
});
