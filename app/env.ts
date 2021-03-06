import * as path from 'path';

export class Env {
    public static getCommitHashBegin(): string {
        if (!process.env.COMMIT_HASH_BEGIN) {
            throw new Error('COMMIT_HASH_BEGIN is not defined.');
        }
        return process.env.COMMIT_HASH_BEGIN;
    }

    public static getCommitHashEnd(): string {
        if (!process.env.COMMIT_HASH_END) {
            throw new Error('COMMIT_HASH_END is not defined.');
        }
        return process.env.COMMIT_HASH_END;
    }

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

    public static getGitLabBranch(): string {
        if (!process.env.GITLAB_BRANCH) {
            throw new Error('GITLAB_BRANCH is not defined.');
        }
        return process.env.GITLAB_BRANCH;
    }

    public static getJenkinsBuildUrl(): string {
        if (!process.env.BUILD_URL) {
            throw new Error('BUILD_URL is not defined.');
        }
        return process.env.BUILD_URL;
    }

    public static isDebugEnable(): boolean {
        const debug = process.env.DEBUG;
        if (!debug) {
            return false;
        }
        if (debug === '1') {
            return true;
        }
        if (debug.toLowerCase() === 'true') {
            return true;
        }
        if (debug.toLowerCase() === 'on') {
            return true;
        }
        return false;
    }
}
