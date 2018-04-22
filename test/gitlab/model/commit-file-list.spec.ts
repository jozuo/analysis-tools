import { CommitComment } from './../../../app/gitlab/model/commit-comment';
import { CommitFileList } from './../../../app/gitlab/model/commit-file-list';
import { RevisionInfoList } from '../../../app/gitlab/model/revision-info-list';
import { CommitFile } from '../../../app/gitlab/model/commit-file';
import { CommitCommentRepository } from '../../../app/gitlab/repository/commit-comment-repository';
import * as assert from 'assert';

describe('CommitFileListSpec', () => {
    let commitFileList: CommitFileList;
    let revisionInfoList: RevisionInfoList;
    describe('constructor', () => {
        let commitComments: CommitComment[];
        it('正常ファイルの場合', () => {
            // prepare
            revisionInfoList = new RevisionInfoList('./test/gitlab/model/commit-file-list-1.spec.txt');
            const lines = [
                '"app/hoge.ts", 20, "comment20"',
                '"app/hoge.ts", 10, "comment10"',
                '"app/page.ts", 11, "comment11"',
                '"app/page.ts", 13, "comment13"',
                '"app/page.ts", 12, "comment12"',
                '"app/foo.ts", 99, "comment99"',
            ];

            // run
            commitFileList = new CommitFileList(lines, revisionInfoList);

            // test
            const commitFiles: CommitFile[] = (commitFileList as any).commitFiles;

            assert(commitFiles.length === 3);
            // - 1ファイル目
            assert(commitFiles[0].getPath() === 'app/foo.ts');
            assert(commitFiles[0].getRevision() === 'revision_foo');
            commitComments = (commitFiles[0] as any).commitComments;
            assert(commitComments.length === 1);
            assert(commitComments[0].getLineNo() === 99);

            // - 2ファイル目
            assert(commitFiles[1].getPath() === 'app/hoge.ts');
            assert(commitFiles[1].getRevision() === 'revision_hoge');
            commitComments = (commitFiles[1] as any).commitComments;
            assert(commitComments.length === 2);
            assert(commitComments[0].getLineNo() === 20);
            assert(commitComments[1].getLineNo() === 10);

            // - 3ファイル目
            assert(commitFiles[2].getPath() === 'app/page.ts');
            assert(commitFiles[2].getRevision() === 'revision_page');
            commitComments = (commitFiles[2] as any).commitComments;
            assert(commitComments.length === 3);
            assert(commitComments[0].getLineNo() === 11);
            assert(commitComments[1].getLineNo() === 13);
            assert(commitComments[2].getLineNo() === 12);
        });
        it('ソートの確認(リビジョン→ファイル名)', () => {
            revisionInfoList = new RevisionInfoList('./test/gitlab/model/commit-file-list-2.spec.txt');
            // prepare
            const lines = [
                '"app/foo.ts", 10, "comment"',
                '"app/bar.ts", 10, "comment"',
                '"app/page.ts", 10, "comment"',
                '"app/hoge.ts", 10, "comment"',
            ];

            // run
            commitFileList = new CommitFileList(lines, revisionInfoList);

            // test
            const commitFiles: CommitFile[] = (commitFileList as any).commitFiles;

            assert(commitFiles.length === 4);
            // - 1ファイル目
            assert(commitFiles[0].getPath() === 'app/hoge.ts');
            assert(commitFiles[0].getRevision() === 'revision1');
            // - 2ファイル目
            assert(commitFiles[1].getPath() === 'app/page.ts');
            assert(commitFiles[1].getRevision() === 'revision1');
            // - 3ファイル目
            assert(commitFiles[2].getPath() === 'app/bar.ts');
            assert(commitFiles[2].getRevision() === 'revision2');
            // - 4ファイル目
            assert(commitFiles[3].getPath() === 'app/foo.ts');
            assert(commitFiles[3].getRevision() === 'revision2');
        });
        it('ファイルが連続せず重複している場合', () => {
            revisionInfoList = new RevisionInfoList('./test/gitlab/model/commit-file-list-1.spec.txt');
            // prepare
            const lines = [
                '"app/hoge.ts", 10, "comment10"',
                '"app/page.ts", 11, "comment11"',
                '"app/hoge.ts", 20, "comment20"',
                '"app/page.ts", 13, "comment13"',
            ];

            // run
            try {
                commitFileList = new CommitFileList(lines, revisionInfoList);
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'file path is not sorted.');
            }
        });
    });
});
