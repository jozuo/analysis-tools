import { DiffInfoBuilder } from './../../../app/gitlab/model/diff-info';
import * as fs from 'fs';
import * as assert from 'assert';

describe('DiffInfoBuilder', () => {
    describe('build()', () => {
        it('差分情報が存在しない場合', () => {
            const json = JSON.parse(fs.readFileSync('./test/gitlab/model/diff-info-builder-1.spec.json', 'UTF-8'));
            const result = new DiffInfoBuilder().setJson(json).build();
            assert(result.getFilePath() === 'sonar-project.properties');
            assert(result.getRanges().length === 0);
        });
        it('差分情報が一つ存在する場合', () => {
            const json = JSON.parse(fs.readFileSync('./test/gitlab/model/diff-info-builder-2.spec.json', 'UTF-8'));
            const result = new DiffInfoBuilder().setJson(json).build();
            assert(result.getFilePath() === 'app/src/component/area-correction/area-correction.component.ts');
            assert(result.getRanges().length = 1);
            assert(JSON.stringify(result.getRanges()[0]) === '{"begin":2,"end":11}');
        });
        it('差分情報が複数存在する場合', () => {
            const json = JSON.parse(fs.readFileSync('./test/gitlab/model/diff-info-builder-3.spec.json', 'UTF-8'));
            const result = new DiffInfoBuilder().setJson(json).build();
            assert(result.getFilePath() === 'app/src/component/area-correction/area-correction.component.ts');
            assert(result.getRanges().length = 2);
            assert(JSON.stringify(result.getRanges()[0]) === '{"begin":2,"end":11}');
            assert(JSON.stringify(result.getRanges()[1]) === '{"begin":36,"end":236}');
        });
    });
});
