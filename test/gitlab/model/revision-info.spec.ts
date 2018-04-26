import { CommitFileRelation } from '../../../app/gitlab/model/revision-info';
import * as assert from 'assert';

describe('RevisionInfo', () => {
    let revisionInfo: CommitFileRelation;
    describe('constructor', () => {
        it('引数が不正な場合1', () => {
            try {
                revisionInfo = new CommitFileRelation('hoge');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'line=[hoge] is illegal.');
            }
        });
    });
    describe('Getter', () => {
        beforeEach(() => {
            revisionInfo = new CommitFileRelation('path string, revision string');
        });
        it('getFile()', () => {
            assert(revisionInfo.getFilePath() === 'path string');
        });
        it('getRevision()', () => {
            assert(revisionInfo.getCommitHash() === 'revision string');
        });
    });
});
