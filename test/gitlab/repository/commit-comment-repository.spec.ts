import { RequestWrapper } from './../../../app/gitlab/repository/request-wrapper';
import { CommitComment } from './../../../app/gitlab/model/commit-comment';
import { CommitFile } from './../../../app/gitlab/model/commit-file';
import { CommitCommentRepository } from './../../../app/gitlab/repository/commit-comment-repository';
import { spy, when, anyString, anyNumber, verify, anything, mock, instance } from 'ts-mockito';
import * as assert from 'assert';

describe('CommitCommentRepository', () => {
    let repository: CommitCommentRepository;

    beforeEach(() => {
        repository = new CommitCommentRepository();
    });
    describe('postSummaryComment()', () => {
        let commitFile: CommitFile;

        beforeEach(() => {
            commitFile = new CommitFile('path string', 'revision string');
        });
        it('summaryCommentが無い場合', async () => {
            // prepare
            const spied = spy<any>(repository);
            when<string>(spied.post(anyString(), anyString(), anyString())).thenResolve('response');
            const spiedCommitFile = spy(commitFile);
            when(spiedCommitFile.getSummaryMessage()).thenReturn(undefined);

            // test
            assert(await repository.postSummaryComment(commitFile) === false);

            // verify
            verify(spied.post(anyString(), anyString(), anyString())).never();

        });
        it('送信成功の場合', async () => {
            // prepare
            const spied = spy<any>(repository);
            when<string>(spied.post(anyString(), anyString(), anyString())).thenResolve('response');
            const spiedCommitFile = spy(commitFile);
            when(spiedCommitFile.getSummaryMessage()).thenReturn('summary message');

            // test
            assert(await repository.postSummaryComment(commitFile) === true);

            // verify
            verify(spied.post('revision string', 'summary message', 'path string')).once();
        });
        it('送信失敗の場合', async () => {
            // prepare
            const spied = spy<any>(repository);
            when<string>(spied.post(anyString(), anyString(), anyString())).thenReject('error message');
            const spiedCommitFile = spy(commitFile);
            when(spiedCommitFile.getSummaryMessage()).thenReturn('summary message');

            try {
                await repository.postSummaryComment(commitFile);
            } catch (error) {
                // test
                assert(error === 'error message');
                verify(spied.post('revision string', 'summary message', 'path string')).once();
            }
        });
    });
    describe('postIndividualComment()', () => {
        let commitComment: CommitComment;

        beforeEach(() => {
            commitComment = new CommitComment(new CommitFile('path', 'revision'), ',123,message');
            const spiedCommitComment = spy(commitComment);
            when(spiedCommitComment.getIndividualMessage()).thenReturn('individual message');
        });
        it('送信成功の場合', async () => {
            // prepare
            const spied = spy<any>(repository);
            when<string>(spied.post(anyString(), anyString(), anyString(), anyNumber())).thenResolve('response');

            // test
            assert(await repository.postIndividualComment(commitComment) === true);

            // verify
            verify(spied.post('revision', 'individual message', 'path', 123)).once();
        });
        it('送信失敗の場合', async () => {
            // prepare
            const spied = spy<any>(repository);
            when<string>(spied.post(anyString(), anyString(), anyString(), anyNumber())).thenReject('error message');

            // run
            try {
                await repository.postIndividualComment(commitComment);
            } catch (error) {
                // test
                assert(error === 'error message');
                verify(spied.post('revision', 'individual message', 'path', 123)).once();
            }
        });
    });
    describe('post()', () => {
        let mocked: RequestWrapper;

        beforeEach(() => {
            process.env.GITLAB_URL = 'http://localhost/toru/project';
            process.env.GITLAB_PROJECT_ID = 'id';
            process.env.GITLAB_TOKEN = 'token';

        });
        it('lineNoが指定され、リクエストが成功した場合', async () => {
            postTest(10);
        });
        async function postTest(lineNo: number): Promise<void> {
            // prepare
            mocked = mock(RequestWrapper);
            when(mocked.post(anything())).thenResolve('{}');
            (repository as any).request = instance(mocked);

            // run
            const result = await (repository as any).post('revision1', 'comment1', 'path1', lineNo);

            // test
            assert(result === '{}');

            // verify
        }
    });
});
