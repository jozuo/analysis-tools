import * as assert from 'assert';
import { Commit } from '../../../app/gitlab/model/commit';
import { CommitComment } from './../../../app/gitlab/model/commit-comment';
import { CommitList } from './../../../app/gitlab/model/commit-list';

describe('CommitList', () => {
    let commitList: CommitList;
    let commit: Commit;
    let commitComment: CommitComment;

    describe('constructor', () => {
        it('CommitHashでソートされているファイルの場合', () => {
            commitList = new CommitList('./test/gitlab/model/commit-list-1.spec.txt');
            assertCommitList();
        });
        it('CommitHashでソートされていないファイルの場合', () => {
            commitList = new CommitList('./test/gitlab/model/commit-list-2.spec.txt');
            assertCommitList();
        });

        function assertCommitList() {
            // test
            const commits: Commit[] = (commitList as any).commits;
            assert(commits.length === 2);

            // No.1
            commit = commits[0];
            assert(commit.getHash() === 'commit-hash1');
            assert((commit as any).commitComments.length === 2);
            // No.1-1
            commitComment = (commit as any).commitComments[0];
            assert(commitComment.getFilePath() === 'app/hoge.ts');
            assert(commitComment.getLineNo() === 10);
            assert((commitComment as any).message === 'comment1');
            // No.1-2
            commitComment = (commit as any).commitComments[1];
            assert(commitComment.getFilePath() === 'app/bar.ts');
            assert(commitComment.getLineNo() === 13);
            assert((commitComment as any).message === 'comment4');

            // No.2
            commit = commits[1];
            assert(commit.getHash() === 'commit-hash2');
            assert((commit as any).commitComments.length === 2);
            // No.1-1
            commitComment = (commit as any).commitComments[0];
            assert(commitComment.getFilePath() === 'app/page.ts');
            assert(commitComment.getLineNo() === 11);
            assert((commitComment as any).message === 'comment2');
            // No.1-2
            commitComment = (commit as any).commitComments[1];
            assert(commitComment.getFilePath() === 'app/foo.ts');
            assert(commitComment.getLineNo() === 12);
            assert((commitComment as any).message === 'comment3');
        }
    });
});
