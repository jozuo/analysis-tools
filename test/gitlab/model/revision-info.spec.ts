import { RevisionInfo } from '../../../app/gitlab/model/revision-info';
import * as assert from 'assert';

describe('RevisionInfo', () => {
    let revisionInfo: RevisionInfo;
    describe('constructor', () => {
        it('引数が不正な場合1', () => {
            try {
                revisionInfo = new RevisionInfo('hoge');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'line=[hoge] is illegal.');
            }
        });
    });
    describe('Getter', () => {
        beforeEach(() => {
            revisionInfo = new RevisionInfo('path string, revision string');
        });
        it('getFile()', () => {
            assert(revisionInfo.getFile() === 'path string');
        });
        it('getRevision()', () => {
            assert(revisionInfo.getRevision() === 'revision string');
        });
    });
});
