import { Range } from './../../../app/gitlab/model/range';
import { DiffInfo, DiffInfoBuilder } from './../../../app/gitlab/model/diff-info';
import { CommitDiffRepository } from './../../../app/gitlab/repository/commit-diff-repository';
import { Commit } from '../../../app/gitlab/model/commit-file';
import { spy, when, anyString, verify, mock, anything, instance, capture } from 'ts-mockito';
import * as fs from 'fs';
import * as assert from 'assert';
import * as request from 'request';
import { RequestWrapper } from '../../../app/gitlab/repository/request-wrapper';

describe('DiffInfoRepository', () => {
    let repository: CommitDiffRepository;

    beforeEach(() => {
        repository = new CommitDiffRepository();
    });
    describe('constructor', () => {
        let diffInfos: DiffInfo[];
        beforeEach(() => {
            diffInfos = [
                new DiffInfoTestBuilder('app/file01.ts', [new Range(11, 21)]).build(),
                new DiffInfoTestBuilder('app/file02.ts', [new Range(12, 22)]).build(),
            ];
        });
        it('リビジョンが同じ場合', async () => {
            // prepare
            const spied = spy<any>(repository);
            when<DiffInfo[]>(spied.getDiffInfos(anyString())).thenResolve(diffInfos);

            // run
            const result1 = await repository.getDiffInfo(new Commit('app/file01.ts', 'reivsion1'));
            const result2 = await repository.getDiffInfo(new Commit('app/file02.ts', 'reivsion1'));

            // assert
            assert(result1.getPath() === 'app/file01.ts');
            assert(JSON.stringify(result1.getRanges()[0]) === '{"begin":11,"end":21}');
            assert(result2.getPath() === 'app/file02.ts');
            assert(JSON.stringify(result2.getRanges()[0]) === '{"begin":12,"end":22}');

            verify(spied.getDiffInfos(anyString())).once(); // 1回しかか呼ばれない
        });
        it('リビジョンが異なる場合', async () => {
            // prepare
            const spied = spy<any>(repository);
            when<DiffInfo[]>(spied.getDiffInfos(anyString())).thenResolve(diffInfos);

            // run
            const result1 = await repository.getDiffInfo(new Commit('app/file01.ts', 'revision1'));
            const result2 = await repository.getDiffInfo(new Commit('app/file02.ts', 'revision2'));

            // assert
            assert(result1.getPath() === 'app/file01.ts');
            assert(JSON.stringify(result1.getRanges()[0]) === '{"begin":11,"end":21}');
            assert(result2.getPath() === 'app/file02.ts');
            assert(JSON.stringify(result2.getRanges()[0]) === '{"begin":12,"end":22}');

            verify(spied.getDiffInfos(anyString())).twice(); // 2回呼ばれる
            verify(spied.getDiffInfos('revision1')).once();
            verify(spied.getDiffInfos('revision2')).once();
        });
    });
    describe('getDiffInfos()', () => {
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
            const results = await (repository as any).getDiffInfos('revision');

            // test
            // - ファイルには5レコード存在するが、deleted_file=trueのデータはスキップされる
            assert(results.length === 3);

            // - 1ファイル目
            let result: DiffInfo;
            result = results[0];
            assert(result.getPath() === 'app/src/component/area-correction/area-correction.component.ts');
            assert(result.getRanges().length === 2);
            assert(JSON.stringify(result.getRanges()[0]) === '{"begin":2,"end":11}');
            assert(JSON.stringify(result.getRanges()[1]) === '{"begin":36,"end":44}');
            // - 2ファイル目
            result = results[1];
            assert(result.getPath() === 'app/src/component/color-matching/color-matching.component.ts');
            assert(result.getRanges().length === 2);
            assert(JSON.stringify(result.getRanges()[0]) === '{"begin":15,"end":22}');
            assert(JSON.stringify(result.getRanges()[1]) === '{"begin":87,"end":105}');
            // - 3ファイル目
            result = results[2];
            assert(result.getPath() === 'app/src/component/geometry-off/geometry-off.component.ts');
            assert(result.getRanges().length === 2);
            assert(JSON.stringify(result.getRanges()[0]) === '{"begin":1,"end":8}');
            assert(JSON.stringify(result.getRanges()[1]) === '{"begin":25,"end":152}');

            // verify
            verify(mocked.get(anything())).once();
            const options = capture(mocked.get).last()[0];
            assert(options.uri === 'http://localhost/api/v4/projects/id/repository/commits/revision/diff');
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
                const results = await (repository as any).getDiffInfos('revision');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error === 'GET operation failed.');
            }
        });
    });

    class DiffInfoTestBuilder extends DiffInfoBuilder {
        constructor(public path: string, public ranges: Range[]) {
            super();
        }
        public build(): DiffInfo {
            return new DiffInfo(this);
        }
    }
});
