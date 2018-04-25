import { DiffInfoBuilder, DiffInfo } from './../../../app/gitlab/model/diff-info';
import { Range } from './../../../app/gitlab/model/range';
import { CommitComment } from './../../../app/gitlab/model/commit-comment';
import { Commit } from './../../../app/gitlab/model/commit-file';
import { CommitCommentRepository } from './../../../app/gitlab/repository/commit-comment-repository';
import { mock, instance, when, anything, verify, deepEqual, capture, reset } from 'ts-mockito/lib/ts-mockito';
import * as assert from 'assert';

describe('CommentFile', () => {
    let commitFile: Commit;
    before(() => {
        commitFile = new Commit('path string', 'revision string');
    });
    describe('Getter', () => {
        it('getPath()', () => {
            assert(commitFile.getPath() === 'path string');
        });
        it('getRevision()', () => {
            assert(commitFile.getHash() === 'revision string');
        });
    });
    describe('isSamePath()', () => {
        it('pathが異なる場合', () => {
            assert(commitFile.isSamePath('hoge') === false);
        });
        it('pathが同じ場合', () => {
            assert(commitFile.isSamePath('path string') === true);
        });
    });
    describe('add()', () => {
        it('要素が追加された場合', () => {
            assert((commitFile as any).commitComments.length === 0);

            commitFile.add('"file path", 123, "comment message"');
            assert((commitFile as any).commitComments.length === 1);

            commitFile.add('"file path", 123, "comment message"');
            assert((commitFile as any).commitComments.length === 2);
        });
    });
    describe('compareTo()', () => {
        it('revisonが異なる場合', () => {
            const obj1 = new Commit('hoge', 'page');
            const obj2 = new Commit('foo', 'bar');
            assert(obj1.compareTo(obj2) === 1);
            assert(obj2.compareTo(obj1) === -1);
        });
        it('revisionが同じ場合', () => {
            const obj1 = new Commit('page', 'hoge');
            const obj2 = new Commit('foo', 'hoge');
            assert(obj1.compareTo(obj2) === 1);
            assert(obj2.compareTo(obj1) === -1);
        });
    });
    describe('getSummaryMessage()', () => {
        let commitComments: CommitComment[];
        beforeEach(() => {
            const diffInfo = new DiffInfoTestBuilder('path', [new Range(10, 20)]).build();
            commitFile.setDiffInfo(diffInfo);
        });
        afterEach(() => {
            // commitComments.forEach((commitComment) => reset(commitComment));
        });
        it('summaryMessageが存在する場合', () => {
            // prepare
            commitComments = [
                createCommitComment(false, 'message 1'),
                createCommitComment(true, 'message 2'),
                createCommitComment(true, 'message 3'),
                createCommitComment(false, 'message 4'),
            ];
            (commitFile as any).commitComments = commitComments;

            let expected = `#### 2 extra issue\n`;
            expected += `\n`;
            expected += `Note: The following issues were found on lines that were not modified in the commit. `;
            expected += `Because these issues can't be reported as line comments, they are summarized here:\n`;
            expected += `\n`;
            expected += `message 1\n`;
            expected += `message 4`;

            // test
            assert(commitFile.getSummaryMessage() === expected);
        });
        it('summaryMessageが存在しない場合', () => {
            // prepare
            commitComments = [
                createCommitComment(true, 'message 1'),
            ];
            (commitFile as any).commitComments = commitComments;

            // test
            assert(commitFile.getSummaryMessage() === undefined);
        });
    });
    describe('postComment()', () => {
        let commitComments: CommitComment[];
        let mocked: CommitCommentRepository;
        beforeEach(() => {
            const diffInfo = new DiffInfoTestBuilder('path', [new Range(10, 20)]).build();
            commitFile.setDiffInfo(diffInfo);

            mocked = mock(CommitCommentRepository);
            const repository = instance(mocked);
            when(mocked.postIndividualComment(anything())).thenResolve(true);
            when(mocked.postSummaryComment(anything())).thenResolve(true);
            (commitFile as any).repository = repository;
        });
        it('IndividualMessageが存在する場合', async () => {
            // prepare
            commitComments = [
                createCommitComment(false, 'message 1'),
                createCommitComment(true, 'message 2'),
                createCommitComment(true, 'message 3'),
                createCommitComment(false, 'message 4'),
            ];
            (commitFile as any).commitComments = commitComments;

            // test
            assert(await commitFile.postComment() === true);

            // verify
            // - CommitCommentRepository#postIndividualComment()
            verify(mocked.postIndividualComment(anything())).twice();
            assert(capture(mocked.postIndividualComment).first()[0].getSummaryMessage() === 'message 2');
            assert(capture(mocked.postIndividualComment).second()[0].getSummaryMessage() === 'message 3');

            // - CommitCommentRepository#postSummaryComment()
            verify(mocked.postSummaryComment(commitFile)).once();
        });
        it('IndividualMessageが存在しない場合', async () => {
            // prepare
            commitComments = [
                createCommitComment(false, 'message 1'),
            ];
            (commitFile as any).commitComments = commitComments;

            // test
            assert(await commitFile.postComment() === true);

            // verify
            // - CommitCommentRepository#postIndividualComment()
            verify(mocked.postIndividualComment(anything())).never();

            // - CommitCommentRepository#postSummaryComment()
            verify(mocked.postSummaryComment(commitFile)).once();
        });
    });

    function createCommitComment(inModifiedLine: boolean, summaryMessage: string): CommitComment {
        const mocked = mock(CommitComment);
        const real = instance(mocked);
        when(mocked.isInModifiedLine(anything())).thenReturn(inModifiedLine);
        when(mocked.getSummaryMessage()).thenReturn(summaryMessage);
        return real;
    }

    class DiffInfoTestBuilder extends DiffInfoBuilder {
        constructor(public path: string, public ranges: Range[]) {
            super();
        }
        public build(): DiffInfo {
            return new DiffInfo(this);
        }
    }
});
