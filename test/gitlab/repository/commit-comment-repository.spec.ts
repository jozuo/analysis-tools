import { Commit } from './../../../app/gitlab/model/commit';
import { RequestWrapper } from './../../../app/gitlab/repository/request-wrapper';
import { CommitComment } from './../../../app/gitlab/model/commit-comment';
import { CommitCommentRepository } from './../../../app/gitlab/repository/commit-comment-repository';
import { spy, when, anyString, anyNumber, verify, anything, mock, instance, capture } from 'ts-mockito';
import * as assert from 'assert';

describe('CommitCommentRepository', () => {
    let repository: CommitCommentRepository;

    beforeEach(() => {
        repository = new CommitCommentRepository();
    });
    describe('postSummaryComment()', () => {
        let commitFile: Commit;

        beforeEach(() => {
            commitFile = new Commit('commit hash string');
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
            when<string>(spied.post(anyString(), anyString())).thenResolve('response');
            const spiedCommitFile = spy(commitFile);
            when(spiedCommitFile.getSummaryMessage()).thenReturn('summary message');

            // test
            assert(await repository.postSummaryComment(commitFile) === true);

            // verify
            verify(spied.post('commit hash string', 'summary message')).once();
        });
        it('送信失敗の場合', async () => {
            // prepare
            const spied = spy<any>(repository);
            when<string>(spied.post(anyString(), anyString())).thenReject('error message');
            const spiedCommitFile = spy(commitFile);
            when(spiedCommitFile.getSummaryMessage()).thenReturn('summary message');

            try {
                await repository.postSummaryComment(commitFile);
            } catch (error) {
                // test
                assert(error === 'error message');
                verify(spied.post('commit hash string', 'summary message')).once();
            }
        });
    });
    describe('postIndividualComment()', () => {
        let commitComment: CommitComment;

        beforeEach(() => {
            commitComment = new CommitComment(new Commit('commit hash'), 'commit hash,path,123,message');
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
            verify(spied.post('commit hash', 'individual message', 'path', 123)).once();
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
                verify(spied.post('commit hash', 'individual message', 'path', 123)).once();
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
            await postTest(10);
        });
        it('lineNoが指定されず、リクエストが成功した場合', async () => {
            await postTest();
        });
        it('リクエストが失敗した場合', async () => {
            // prepare
            mocked = mock(RequestWrapper);
            when(mocked.post(anything())).thenReject('failed');
            (repository as any).request = instance(mocked);

            // run
            try {
                const result = await (repository as any).post('revision1', 'comment1', 'path1');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error === 'POST operation failed.');
            }
        });
        async function postTest(lineNo?: number): Promise<void> {
            // prepare
            mocked = mock(RequestWrapper);
            when(mocked.post(anything())).thenResolve('{}');
            (repository as any).request = instance(mocked);

            // run
            const result = await (repository as any).post('revision1', 'comment1', 'path1', lineNo);

            // test
            assert(result === '{}');

            // verify
            verify(mocked.post(anything())).once();
            const options = capture(mocked.post).last()[0];
            assert(options.uri === 'http://localhost/api/v4/projects/id/repository/commits/revision1/comments');
            assert(options.proxy === undefined);
            assert(JSON.stringify(options.headers) === '{"PRIVATE-TOKEN":"token"}');
            assert(options.form.note === 'comment1');
            assert(options.form.path === 'path1');
            assert(options.form.line === (lineNo) ? lineNo : -1);
            assert(options.form.line_type === 'new');
        }
    });
});
