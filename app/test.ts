import { ChangeFileList } from './git/model/change-file-list';
import { CommitList } from './gitlab/model/commit-list';
import * as request from 'request-promise-native';
import { CommitStatusRepository } from './gitlab/repository/commit-status-repository';
import { GitCommand } from './git/repository/git-command';

const HOST = 'localhost';

describe('GitLabコミットコメントのテスト', () => {
    before(() => {
        process.env.GITLAB_URL = `http://gitlab/toru/professional-tool`;
        process.env.GITLAB_PROJECT_ID = '1';
        process.env.GITLAB_TOKEN = 'r25vP4p9iRJg_ei7XqSg';
        process.env.COMMIT_HASH_BEGIN = 'origin/develop';
        process.env.COMMIT_HASH_END = '412bb9e9eb00f674d60d9403bcdb81dd017b0c2a';
        process.env.GITLAB_BRANCH = 'test';
        process.env.BUILD_URL = 'http://localhost:8080/job/pro-tool-analysis/111/';
    });
    it('差分抽出', () => {
        const changeFiles = new ChangeFileList(new GitCommand('/Users/toru/work/professional-tool')).getFiles();
    });
    it.only('テスト実行', async () => {
        const target = new CommitList('/Users/toru/work/issues.csv');
        await target.postComment();
    });
    it('diffの解析', () => {
        const revision = 'c59d1508e8876e7c91c9d3fb0465c67b50c665fd';
        const token = 'tV6o8iYtFpKqFcTp9L_m';
        const options = {
            method: 'GET',
            uri: `http://${HOST}/api/v4/projects/2/repository/commits/${revision}/diff`,
            proxy: process.env.PROXY || undefined,
            headers: {
                'PRIVATE-TOKEN': token,
            },
        };

        request(options).then((response) => {
            getDiffInfo(response);
        });
    });
    it.only('コミットステータス通知', async () => {
        const repository = new CommitStatusRepository();
        await repository.post('success', 'テスト実行成功');
    });

    function getDiffInfo(response: any): void {
        JSON.parse(response).filter((block: any) => {
            return !block.deleted_file;
        }).forEach((block: any) => {
            const file = block.new_path;
            const diff = block.diff; // todo loop
            diff.toString().match(/@@ -(\d+?),(\d+?) \+(\d+?),(\d+?) @@/g).forEach((lineInfo: any) => {
                const begin = Number(lineInfo.match(/\+(\d+?),(\d+?)/g)[0].split(',')[0].replace('+', ''));
                const end = begin + Number(lineInfo.match(/\+(\d+?),(\d+?)/g)[0].split(',')[1]);
                console.log(`${file} : ${begin} - ${end}`);
            });
        });
    }
});
