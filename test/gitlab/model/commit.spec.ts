import * as assert from 'assert';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito/lib/ts-mockito';
import { Commit } from '../../../app/gitlab/model/commit';
import { DiffInfoList } from '../../../app/gitlab/model/diff-info-list';
import { CommitComment } from './../../../app/gitlab/model/commit-comment';
import { DiffInfo, DiffInfoBuilder } from './../../../app/gitlab/model/diff-info';
import { Range } from './../../../app/gitlab/model/range';
import { CommitCommentRepository } from './../../../app/gitlab/repository/commit-comment-repository';

describe('Comment', () => {
    let commit: Commit;
    before(() => {
        commit = new Commit('commit hash string');
    });
    describe('Getter', () => {
        it('getHash()', () => {
            assert(commit.getHash() === 'commit hash string');
        });
    });
    describe('add()', () => {
        it('要素が追加された場合', () => {
            assert((commit as any).commitComments.length === 0);

            commit.add('"commit-hash","file path", 123, "comment message"');
            assert((commit as any).commitComments.length === 1);

            commit.add('"commit-hash","file path", 123, "comment message"');
            assert((commit as any).commitComments.length === 2);
        });
    });
    describe('getSummaryMessage()', () => {
        let commitComments: CommitComment[];
        beforeEach(() => {
            const diffInfo = new DiffInfoTestBuilder('path', [new Range(10, 20)]).build();
            commit.setDiffInfoList(new DiffInfoList(([diffInfo])));
        });
        it('summaryMessageが存在する場合', () => {
            // prepare
            commitComments = [
                createCommitComment(false, 'message 1'),
                createCommitComment(true, 'message 2'),
                createCommitComment(true, 'message 3'),
                createCommitComment(false, 'message 4'),
            ];
            (commit as any).commitComments = commitComments;

            let expected = `#### 2 extra issue\n`;
            expected += `\n`;
            expected += `Note: The following issues were found on lines that were not modified in the commit. `;
            expected += `Because these issues can't be reported as line comments, they are summarized here:\n`;
            expected += `\n`;
            expected += `message 1\n`;
            expected += `message 4`;

            // test
            assert(commit.getSummaryMessage() === expected);
        });
        it('summaryMessageが存在しない場合', () => {
            // prepare
            commitComments = [
                createCommitComment(true, 'message 1'),
            ];
            (commit as any).commitComments = commitComments;

            // test
            assert(commit.getSummaryMessage() === undefined);
        });
    });
    describe('postComment()', () => {
        let commitComments: CommitComment[];
        let mocked: CommitCommentRepository;
        beforeEach(() => {
            const diffInfo = new DiffInfoTestBuilder('path', [new Range(10, 20)]).build();
            commit.setDiffInfoList(new DiffInfoList([diffInfo]));

            mocked = mock(CommitCommentRepository);
            const repository = instance(mocked);
            when(mocked.postIndividualComment(anything())).thenResolve(true);
            when(mocked.postSummaryComment(anything())).thenResolve(true);
            (commit as any).repository = repository;
        });
        it('IndividualMessageが存在する場合', async () => {
            // prepare
            commitComments = [
                createCommitComment(false, 'message 1'),
                createCommitComment(true, 'message 2'),
                createCommitComment(true, 'message 3'),
                createCommitComment(false, 'message 4'),
            ];
            (commit as any).commitComments = commitComments;

            // test
            assert(await commit.postComment() === true);

            // verify
            // - CommitCommentRepository#postIndividualComment()
            verify(mocked.postIndividualComment(anything())).twice();
            assert(capture(mocked.postIndividualComment).first()[0].getSummaryMessage() === 'message 2');
            assert(capture(mocked.postIndividualComment).second()[0].getSummaryMessage() === 'message 3');

            // - CommitCommentRepository#postSummaryComment()
            verify(mocked.postSummaryComment(commit)).once();
        });
        it('IndividualMessageが存在しない場合', async () => {
            // prepare
            commitComments = [
                createCommitComment(false, 'message 1'),
            ];
            (commit as any).commitComments = commitComments;

            // test
            assert(await commit.postComment() === true);

            // verify
            // - CommitCommentRepository#postIndividualComment()
            verify(mocked.postIndividualComment(anything())).never();

            // - CommitCommentRepository#postSummaryComment()
            verify(mocked.postSummaryComment(commit)).once();
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
