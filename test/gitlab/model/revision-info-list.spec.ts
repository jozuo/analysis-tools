import { RevisionInfoList } from '../../../app/gitlab/model/revision-info-list';
import { RevisionInfo } from '../../../app/gitlab/model/revision-info';
import * as assert from 'assert';

describe('RevisionInfoList', () => {
    let revisionInfoList: RevisionInfoList;
    describe('constructor', () => {
        it('データが存在する場合', () => {
            revisionInfoList = new RevisionInfoList('test/gitlab/model/revision-info-list-1.spec.txt');
            assert.ok(revisionInfoList);

            const revisionInfos: RevisionInfo[] = (revisionInfoList as any).revisionInfos;
            assert(revisionInfos.length === 2);
            assert(revisionInfos[0].getFile() === 'app/src/component/area-correction/area-correction.component.ts');
            assert(revisionInfos[0].getRevision() === 'c59d1508e8876e7c91c9d3fb0465c67b50c665fd');
            assert(revisionInfos[1].getFile() === 'app/src/component/color-matching/color-matching.component.ts');
            assert(revisionInfos[1].getRevision() === 'c59d1508e8876e7c91c9d3fb0465c67b50c665fd');
        });
        it('データが存在しない場合', () => {
            try {
                revisionInfoList = new RevisionInfoList('test/gitlab/model/revision-info-list-2.spec.txt');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'file is empty.');
            }
        });
    });
    describe('getRevision()', () => {
        beforeEach(() => {
            revisionInfoList = new RevisionInfoList('test/gitlab/model/revision-info-list-3.spec.txt');
        });
        it('fileの情報が存在しない場合', () => {
            try {
                revisionInfoList.getRevision('hoge');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'file [hoge] match 0 times.');
            }
        });
        it('fileの情報が1件存在する場合', () => {
            const file = 'app/src/component/color-matching/color-matching.component.ts';
            assert(revisionInfoList.getRevision(file) === 'a59d1508e8876e7c91c9d3fb0465c67b50c665fd');
        });
        it('fileの情報が複数件存在する場合', () => {
            const file = 'app/src/component/area-correction/area-correction.component.ts';
            try {
                revisionInfoList.getRevision(file);
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === `file [${file}] match 2 times.`);
            }
        });
    });
});
