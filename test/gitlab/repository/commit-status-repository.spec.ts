import * as assert from 'assert';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito/lib/ts-mockito';
import { CommitStatusRepository } from './../../../app/gitlab/repository/commit-status-repository';
import { RequestWrapper } from './../../../app/gitlab/repository/request-wrapper';

describe('CommitStatusRepository', () => {
    let repository: CommitStatusRepository;

    beforeEach(() => {
        repository = new CommitStatusRepository();
    });
    describe('post()', () => {
        let mocked: RequestWrapper;

        beforeEach(() => {
            process.env.GITLAB_URL = 'http://localhost/toru/project';
            process.env.GITLAB_PROJECT_ID = 'id';
            process.env.GITLAB_TOKEN = 'token';
            process.env.COMMIT_HASH_END = 'commit-hash-end';
            process.env.GITLAB_BRANCH = 'branch';
            process.env.BUILD_URL = 'http://jenkins:8080/job/5';
        });
        it('最大の引数指定で リクエストが成功した場合', async () => {
            // prepare
            mocked = mock(RequestWrapper);
            when(mocked.post(anything())).thenResolve('{}');
            (repository as any).request = instance(mocked);

            // run
            const result = await (repository.post('running', 'description', 98.5));

            // test
            assert(result === '{}');

            // verify
            verify(mocked.post(anything())).once();
            const options = capture(mocked.post).last()[0];
            assert(options.uri === 'http://localhost/api/v4/projects/id/statuses/commit-hash-end');
            assert(options.proxy === undefined);
            assert(JSON.stringify(options.headers) === '{"PRIVATE-TOKEN":"token"}');
            assert(options.form.state === 'running');
            assert(options.form.ref === 'branch');
            assert(options.form.name === 'jenkins');
            assert(options.form.target_url === 'http://jenkins:8080/job/5');
            assert(options.form.description === 'description');
            assert(options.form.coverage === 98.5);
        });
        it('最小の引数指定で リクエストが成功した場合', async () => {
            // prepare
            mocked = mock(RequestWrapper);
            when(mocked.post(anything())).thenResolve('{}');
            (repository as any).request = instance(mocked);

            // run
            const result = await (repository.post('running'));

            // test
            assert(result === '{}');

            // verify
            verify(mocked.post(anything())).once();
            const options = capture(mocked.post).last()[0];
            assert(options.uri === 'http://localhost/api/v4/projects/id/statuses/commit-hash-end');
            assert(options.proxy === undefined);
            assert(JSON.stringify(options.headers) === '{"PRIVATE-TOKEN":"token"}');
            assert(options.form.state === 'running');
            assert(options.form.ref === 'branch');
            assert(options.form.name === 'jenkins');
            assert(options.form.target_url === 'http://jenkins:8080/job/5');
            assert(options.form.description === undefined);
            assert(options.form.coverage === undefined);
        });
        it('リクエストが失敗した場合', async () => {
            // prepare
            mocked = mock(RequestWrapper);
            when(mocked.post(anything())).thenReject('failed');
            (repository as any).request = instance(mocked);

            // run
            try {
                const result = await (repository.post('running'));
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error === 'POST operation failed.');
            }
        });
    });
});
