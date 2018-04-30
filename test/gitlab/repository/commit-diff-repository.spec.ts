import * as assert from 'assert';
import * as fs from 'fs';
import { anything, capture, instance, mock, verify, when } from 'ts-mockito';
import { RequestWrapper } from '../../../app/gitlab/repository/request-wrapper';
import { DiffInfo } from './../../../app/gitlab/model/diff-info';
import { CommitDiffRepository } from './../../../app/gitlab/repository/commit-diff-repository';

describe('DiffInfoRepository', () => {
    let repository: CommitDiffRepository;

    beforeEach(() => {
        repository = new CommitDiffRepository();
    });
    describe('getDiffInfoList()', () => {
        let mocked: RequestWrapper;

        beforeEach(() => {
            process.env.GITLAB_URL = 'http://localhost/toru/project';
            process.env.GITLAB_PROJECT_ID = 'id';
            process.env.GITLAB_TOKEN = 'token';

        });
        it('リクエストが成功した場合', async () => {
            // prepare
            mocked = mock(RequestWrapper);
            when(mocked.get(anything())).thenResolve(
                fs.readFileSync('test/gitlab/repository/commit-diff-repository.spec.json', 'UTF-8'));
            ((repository as any).request) = instance(mocked);

            // run
            const diffInfoList = await repository.getDiffInfoList('commit-hash');

            // test
            // - ファイルには5レコード存在するが、deleted_file=trueのデータはスキップされる
            assert((diffInfoList as any).diffInfos.length === 3);

            // - 1ファイル目
            let result: DiffInfo;
            result = (diffInfoList as any).diffInfos[0];
            assert(result.getFilePath() === 'app/src/component/area-correction/area-correction.component.ts');
            assert(result.getRanges().length === 2);
            assert(JSON.stringify(result.getRanges()[0]) === '{"begin":2,"end":11}');
            assert(JSON.stringify(result.getRanges()[1]) === '{"begin":36,"end":44}');
            // - 2ファイル目
            result = (diffInfoList as any).diffInfos[1];
            assert(result.getFilePath() === 'app/src/component/color-matching/color-matching.component.ts');
            assert(result.getRanges().length === 2);
            assert(JSON.stringify(result.getRanges()[0]) === '{"begin":15,"end":22}');
            assert(JSON.stringify(result.getRanges()[1]) === '{"begin":87,"end":105}');
            // - 3ファイル目
            result = (diffInfoList as any).diffInfos[2];
            assert(result.getFilePath() === 'app/src/component/geometry-off/geometry-off.component.ts');
            assert(result.getRanges().length === 2);
            assert(JSON.stringify(result.getRanges()[0]) === '{"begin":1,"end":8}');
            assert(JSON.stringify(result.getRanges()[1]) === '{"begin":25,"end":152}');

            // verify
            verify(mocked.get(anything())).once();
            const options = capture(mocked.get).last()[0];
            assert(options.uri === 'http://localhost/api/v4/projects/id/repository/commits/commit-hash/diff');
            assert(options.proxy === undefined);
            assert(JSON.stringify(options.headers) === '{"PRIVATE-TOKEN":"token"}');
        });
        it('リクエストが失敗した場合', async () => {
            // prepare
            mocked = mock(RequestWrapper);
            when(mocked.get(anything())).thenReject('failed');
            ((repository as any).request) = instance(mocked);

            // run
            try {
                const results = await repository.getDiffInfoList('commit-hash');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error === 'GET operation failed.');
            }
        });
    });
});
