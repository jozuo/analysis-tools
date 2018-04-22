import * as path from 'path';

export class Env {
    public static getGitLabUrl(): string {
        if (!process.env.GITLAB_URL) {
            throw new Error('GITLAB_URL is not defined.');
        }
        return process.env.GITLAB_URL;
    }

    public static getGitLabAPIEndPoint(): string {
        if (!process.env.GITLAB_URL) {
            throw new Error('GITLAB_URL is not defined.');
        }
        if (!process.env.GITLAB_PROJECT_ID) {
            throw new Error('GITLAB_PROJECT_ID is not defined.');
        }
        // GitLabのルートパスに変換(ユーザーを表すパス、プロジェクトを表すパスを除去)
        let url = process.env.GITLAB_URL;
        url = url.substring(0, url.lastIndexOf('/'));
        url = url.substring(0, url.lastIndexOf('/'));

        // API Enpointに変換
        return url + path.join('/api/v4/projects', process.env.GITLAB_PROJECT_ID);
    }

    public static getGitLabToken(): string {
        if (!process.env.GITLAB_TOKEN) {
            throw new Error('GITLAB_TOKEN is not defined.');
        }
        return process.env.GITLAB_TOKEN;
    }
}
