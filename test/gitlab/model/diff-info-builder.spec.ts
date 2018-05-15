import * as assert from 'assert';
import * as fs from 'fs';
import { DiffInfo, DiffInfoBuilder } from './../../../app/gitlab/model/diff-info';

describe('DiffInfoBuilder', () => {
    describe('build()', () => {
        it('差分情報が存在しない場合', () => {
            const json = JSON.parse(fs.readFileSync('./test/gitlab/model/diff-info-builder-1.spec.json', 'UTF-8'));
            const result = new DiffInfoBuilder().setJson(json).build();
            assert(result.getFilePath() === 'sonar-project.properties');
            assert(getDiffLineNos(result).length === 0);
        });
        it('差分情報が一つ存在する場合', () => {
            const json = JSON.parse(fs.readFileSync('./test/gitlab/model/diff-info-builder-2.spec.json', 'UTF-8'));
            const result = new DiffInfoBuilder().setJson(json).build();
            assert(result.getFilePath() === 'app/src/component/modal/modal-geometry-info-comparison.component.ts');
            assert(getDiffLineNos(result).length = 2);
            assert(getDiffLineNos(result)[0] === 135);
            assert(getDiffLineNos(result)[1] === 136);
        });
        it('差分情報が複数存在する場合', () => {
            const json = JSON.parse(fs.readFileSync('./test/gitlab/model/diff-info-builder-3.spec.json', 'UTF-8'));
            const result = new DiffInfoBuilder().setJson(json).build();
            assert(result.getFilePath() === 'app/src/component/edge-blending/edge-blending.component.ts');
            assert(getDiffLineNos(result).length = 3);
            assert(getDiffLineNos(result)[0] === 593);
            assert(getDiffLineNos(result)[1] === 987);
            assert(getDiffLineNos(result)[2] === 1552);
        });
        it('差分情報が複数存在する場合(連続行含む)', () => {
            const json = JSON.parse(fs.readFileSync('./test/gitlab/model/diff-info-builder-4.spec.json', 'UTF-8'));
            const result = new DiffInfoBuilder().setJson(json).build();
            assert(result.getFilePath() === 'app/src/component/image-basic/image-basic.component.ts');
            assert(getDiffLineNos(result).length = 11);
            assert(getDiffLineNos(result)[0] === 776);
            assert(getDiffLineNos(result)[1] === 777);
            assert(getDiffLineNos(result)[2] === 778);
            assert(getDiffLineNos(result)[3] === 779);
            assert(getDiffLineNos(result)[4] === 780);
            assert(getDiffLineNos(result)[5] === 1288);
            assert(getDiffLineNos(result)[6] === 1291);
            assert(getDiffLineNos(result)[7] === 1294);
            assert(getDiffLineNos(result)[8] === 1297);
            assert(getDiffLineNos(result)[9] === 1300);
            assert(getDiffLineNos(result)[10] === 1305);
        });
    });

    function getDiffLineNos(diffInfo: DiffInfo): number[] {
        return (diffInfo as any).diffLineNos;
    }
});
