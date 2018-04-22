import { CommitCommentRequester } from './gitlab/commit-comment-requester';
import * as request from 'request-promise-native';

const HOST = 'localhost';

describe('GitLabコミットコメントのテスト', () => {
    before(() => {
        process.env.GITLAB_URL = `http://localhost/toru/professional-tool`;
        process.env.GITLAB_PROJECT_ID = '1';
        process.env.GITLAB_TOKEN = 'tV6o8iYtFpKqFcTp9L_m';
    });
    it.only('テスト実行', async () => {
        const target = new CommitCommentRequester('./test/gitlab/file-revision.txt');
        await target.postComment('./test/gitlab/tslint-result.csv');
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
