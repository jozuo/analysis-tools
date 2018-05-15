import * as assert from 'assert';
import { DiffInfo, DiffInfoBuilder } from './../../../app/gitlab/model/diff-info';

describe('DiffInfo', () => {
    let diffInfo: DiffInfo;
    describe('Getter', () => {
        it('getPath()', () => {
            diffInfo = new DiffInfoTestBuilder('path string', [11, 22]).build();
            assert(diffInfo.getFilePath() === 'path string');
        });
    });
    describe('isModifiedLine()', () => {
        it('差分行情報が存在する場合', () => {
            diffInfo = new DiffInfoTestBuilder('path string', [11, 22]).build();
            assert(diffInfo.isModifiedLine(10) === false);
            assert(diffInfo.isModifiedLine(11) === true);
            assert(diffInfo.isModifiedLine(22) === true);
            assert(diffInfo.isModifiedLine(23) === false);
        });
        it('差分行情報が存在しない場合', () => {
            diffInfo = new DiffInfoTestBuilder('path string', []).build();
            assert(diffInfo.isModifiedLine(10) === false);
        });
    });

    class DiffInfoTestBuilder extends DiffInfoBuilder {
        constructor(public filePath: string, public diffLineNos: number[]) {
            super();
        }
        public build(): DiffInfo {
            return new DiffInfo(this);
        }
    }
});
