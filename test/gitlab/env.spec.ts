import * as assert from 'assert';
import { Env } from '../../app/gitlab/env';

describe('Env', () => {
    beforeEach(() => {
        process.env.GITLAB_URL = '';
        process.env.GITLAB_PROJECT_ID = '';
        process.env.GITLAB_TOKEN = '';
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
});
