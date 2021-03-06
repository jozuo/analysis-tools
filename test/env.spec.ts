import * as assert from 'assert';
import { Env } from '../app/env';

describe('Env', () => {
    beforeEach(() => {
        process.env.COMMIT_HASH_BEGIN = '';
        process.env.COMMIT_HASH_END = '';
        process.env.GITLAB_URL = '';
        process.env.GITLAB_PROJECT_ID = '';
        process.env.GITLAB_TOKEN = '';
        process.env.GITLAB_BRANCH = '';
        process.env.BUILD_URL = '';
    });
    describe('getCommitHashBegin()', () => {
        it('環境変数がセットされていない場合', () => {
            assert.throws(() => Env.getCommitHashBegin(), (error: any) => {
                assert(error.message === 'COMMIT_HASH_BEGIN is not defined.');
                return true;
            });
        });
        it('環境変数がセットされている場合', () => {
            // prepare
            process.env.COMMIT_HASH_BEGIN = 'commit-hash-begin';

            // test
            assert(Env.getCommitHashBegin() === 'commit-hash-begin');
        });
    });
    describe('getCommitHashEnd()', () => {
        it('環境変数がセットされていない場合', () => {
            assert.throws(() => Env.getCommitHashEnd(), (error: any) => {
                assert(error.message === 'COMMIT_HASH_END is not defined.');
                return true;
            });
        });
        it('環境変数がセットされている場合', () => {
            // prepare
            process.env.COMMIT_HASH_END = 'commit-hash-end';

            // test
            assert(Env.getCommitHashEnd() === 'commit-hash-end');
        });
    });
    describe('getGitLabUrl()', () => {
        it('環境変数がセットされていない場合', () => {
            assert.throws(() => Env.getGitLabUrl(), (error: any) => {
                assert(error.message === 'GITLAB_URL is not defined.');
                return true;
            });
        });
        it('環境変数がセットされている場合', () => {
            // prepare
            process.env.GITLAB_URL = 'http://localhost/gitlab';

            // test
            assert(Env.getGitLabUrl() === 'http://localhost/gitlab');
        });
    });
    describe('getGitLabAPIEndPoint()', () => {
        it('環境変数が一つも設定されていない場合', () => {
            assert.throws(() => Env.getGitLabAPIEndPoint(), (error: any) => {
                assert(error.message === 'GITLAB_URL is not defined.');
                return true;
            });
        });
        it('環境変数が一つだけ設定されていない場合', () => {
            // prepare
            process.env.GITLAB_URL = 'http://localhost/toru/project';
            assert.throws(() => Env.getGitLabAPIEndPoint(), (error: any) => {
                assert(error.message === 'GITLAB_PROJECT_ID is not defined.');
                return true;
            });
        });
        it('必要な環境変数がセットされている場合(コンテキストパスなし)', () => {
            // prepare
            process.env.GITLAB_URL = 'http://localhost/toru/project';
            process.env.GITLAB_PROJECT_ID = '123';

            // test
            assert(Env.getGitLabAPIEndPoint() === 'http://localhost/api/v4/projects/123');
        });
        it('必要な環境変数がセットされている場合(コンテキストパスあり)', () => {
            // prepare
            process.env.GITLAB_URL = 'http://localhost/git1/toru/project';
            process.env.GITLAB_PROJECT_ID = '123';

            // test
            assert(Env.getGitLabAPIEndPoint() === 'http://localhost/git1/api/v4/projects/123');
        });
    });
    describe('getGitLabToken()', () => {
        it('環境変数が設定されていない場合', () => {
            assert.throws(() => Env.getGitLabToken(), (error: any) => {
                assert(error.message === 'GITLAB_TOKEN is not defined.');
                return true;
            });
        });
        it('環境変数がセットされている場合', () => {
            // prepare
            process.env.GITLAB_TOKEN = 'hogepagefoo';

            // test
            assert(Env.getGitLabToken() === 'hogepagefoo');
        });
    });
    describe('getGitLabBranch()', () => {
        it('環境変数が設定されていない場合', () => {
            assert.throws(() => Env.getGitLabBranch(), (error: any) => {
                assert(error.message === 'GITLAB_BRANCH is not defined.');
                return true;
            });
        });
        it('環境変数がセットされている場合', () => {
            // prepare
            process.env.GITLAB_BRANCH = 'branch_name';

            // test
            assert(Env.getGitLabBranch() === 'branch_name');
        });
    });
    describe('getJenkinsBuildUrl()', () => {
        it('環境変数が設定されていない場合', () => {
            assert.throws(() => Env.getJenkinsBuildUrl(), (error: any) => {
                assert(error.message === 'BUILD_URL is not defined.');
                return true;
            });
        });
        it('環境変数がセットされている場合', () => {
            // prepare
            process.env.BUILD_URL = 'http://jenkins:8080/job/5';

            // test
            assert(Env.getJenkinsBuildUrl() === 'http://jenkins:8080/job/5');
        });
    });
    describe('isDebugEnable()', () => {
        it('環境変数が設定されていない場合', () => {
            assert(Env.isDebugEnable() === false);
        });
        it('環境変数がセットされている場合1', () => {
            process.env.DEBUG = '1';
            assert(Env.isDebugEnable() === true);
        });
        it('環境変数がセットされている場合2', () => {
            process.env.DEBUG = '1';
            assert(Env.isDebugEnable() === true);
        });
        it('環境変数がセットされている場合3', () => {
            process.env.DEBUG = 'true';
            assert(Env.isDebugEnable() === true);
        });
        it('環境変数がセットされている場合4', () => {
            process.env.DEBUG = 'TrUe';
            assert(Env.isDebugEnable() === true);
        });
        it('環境変数がセットされている場合5', () => {
            process.env.DEBUG = 'on';
            assert(Env.isDebugEnable() === true);
        });
        it('環境変数がセットされている場合6', () => {
            process.env.DEBUG = 'On';
            assert(Env.isDebugEnable() === true);
        });
    });
});
