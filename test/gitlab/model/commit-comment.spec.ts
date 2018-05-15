import * as assert from 'assert';
import { DiffInfoList } from '../../../app/gitlab/model/diff-info-list';
import { Commit } from './../../../app/gitlab/model/commit';
import { CommitComment } from './../../../app/gitlab/model/commit-comment';
import { DiffInfo, DiffInfoBuilder } from './../../../app/gitlab/model/diff-info';

describe('CommitComment', () => {
    let commit: Commit;
    before(() => {
        commit = new Commit('commit hash string');
    });
    describe('constructor', () => {
        it('引数が不正な場合1', () => {
            try {
                const commitComment = new CommitComment(commit, 'commit-hash');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'line=[commit-hash] is illegal.');
            }
        });
        it('引数が不正な場合2', () => {
            try {
                const commitComment = new CommitComment(commit, 'commit-hash,path');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'line=[commit-hash,path] is illegal.');
            }
        });
        it('引数が不正な場合3', () => {
            try {
                const commitComment = new CommitComment(commit, 'commit-hash,path,123');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'line=[commit-hash,path,123] is illegal.');
            }
        });
    });
    describe('Getter', () => {
        let instance: CommitComment;

        it('getFilePath()', () => {
            const line = '"commit hash","file path", 123, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.getFilePath() === 'file path');
        });
        it('getCommitHash()', () => {
            const line = '"commit hash", "file path", 123, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.getCommitHash() === 'commit hash string');
        });
        it('getLineNo()', () => {
            const line = '"commit hash","file path", 123, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.getLineNo() === 123);
        });
        it('getGitLabBlobUrl()', () => {
            process.env.GITLAB_URL = 'http://localhost/toru/professional-tool';
            process.env.GITLAB_PROJECT_ID = '1';
            const line = '"commit hash", file path", 123, "comment message"';
            instance = new CommitComment(commit, line);

            const expected = 'http://localhost/toru/professional-tool/blob/commit hash string/file path/#L123';
            assert((instance as any).getGitLabBlobUrl() === expected);
        });
    });
    describe('isInModifiedLine()', () => {
        let instance: CommitComment;
        let diffInfoList: DiffInfoList;

        before(() => {
            diffInfoList = new DiffInfoList([new DiffInfoTestBuilder('path string', [10, 20, 30, 40]).build()]);
        });
        it('変更行にマッチする場合1', () => {
            const line = '"commit hash","path string", 10, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.isInModifiedLine(diffInfoList) === true);
        });
        it('変更行にマッチする場合2', () => {
            const line = '"commit hash","path string", 20, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.isInModifiedLine(diffInfoList) === true);
        });
        it('変更行にマッチしない場合1', () => {
            const line = '"commit hash","path string", 9, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.isInModifiedLine(diffInfoList) === false);
        });
        it('変更行にマッチしない場合2', () => {
            const line = '"commit hash","path string", 21, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.isInModifiedLine(diffInfoList) === false);
        });
        it('Diff情報が存在しないファイルの場合', () => {
            const line = '"commit-hash","hogehogehoge", 30, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.isInModifiedLine(diffInfoList) === false);
        });
    });
    describe('getIndividualMessage()', () => {
        let instance: CommitComment;

        it('最低限の引数の場合', () => {
            const line = '"commit-hash","file path", 123, "comment message"';
            instance = new CommitComment(commit, line);
            assert(instance.getIndividualMessage() === ':no_entry_sign: comment message');
        });
        it('レベルwarning指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", "warning"';
            instance = new CommitComment(commit, line);
            assert(instance.getIndividualMessage() === ':warning: comment message');
        });
        it('レベルerror指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", "no_entry_sign"';
            instance = new CommitComment(commit, line);
            assert(instance.getIndividualMessage() === ':no_entry_sign: comment message');
        });
        it('レベルで指定値以外が指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", "hoge"';
            instance = new CommitComment(commit, line);
            assert(instance.getIndividualMessage() === ':no_entry_sign: comment message');
        });
        it('ルール名が指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", , "rule name string"';
            instance = new CommitComment(commit, line);
            assert(instance.getIndividualMessage() === ':no_entry_sign: comment message(rule name string)');
        });
        it('ルールURLが指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", , ,"http://localhost/hoge/"';
            instance = new CommitComment(commit, line);
            const expected = ':no_entry_sign: comment message [:blue_book:](http://localhost/hoge/)';
            assert(instance.getIndividualMessage() === expected);
        });
    });
    describe('getSummaryMessage()', () => {
        const GITLAB_URL = 'http://localhost/toru/professional-tool';
        const GITLAB_PROJECT_ID = '1';
        const GITLAB_BLOB_URL = 'http://localhost/toru/professional-tool/blob/commit hash string/file path/#L123';

        beforeEach(() => {
            process.env.GITLAB_URL = GITLAB_URL;
            process.env.GITLAB_PROJECT_ID = GITLAB_PROJECT_ID;
        });
        it('最低限の引数の場合', () => {
            const line = '"commit-hash","file path", 123, "comment message"';
            const result = new CommitComment(commit, line).getSummaryMessage();
            assert(result === `1. [:no_entry_sign: comment message](${GITLAB_BLOB_URL})`);
        });
        it('レベルwarning指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", "warning"';
            const result = new CommitComment(commit, line).getSummaryMessage();
            assert(result === `1. [:warning: comment message](${GITLAB_BLOB_URL})`);
        });
        it('レベルerror指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", "error"';
            const result = new CommitComment(commit, line).getSummaryMessage();
            assert(result === `1. [:no_entry_sign: comment message](${GITLAB_BLOB_URL})`);
        });
        it('レベルで指定値以外が指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", "hoge"';
            const result = new CommitComment(commit, line).getSummaryMessage();
            assert(result === `1. [:no_entry_sign: comment message](${GITLAB_BLOB_URL})`);
        });
        it('ルール名が指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", , "rule name string"';
            const result = new CommitComment(commit, line).getSummaryMessage();
            assert(result === `1. [:no_entry_sign: comment message(rule name string)](${GITLAB_BLOB_URL})`);
        });
        it('ルールURLが指定されている場合', () => {
            const line = '"commit-hash","file path", 123, "comment message", , ,"http://localhost/hoge/"';
            const result = new CommitComment(commit, line).getSummaryMessage();

            const ruleUrl = '[:blue_book:](http://localhost/hoge/)';
            assert(result === `1. [:no_entry_sign: comment message](${GITLAB_BLOB_URL}) ${ruleUrl}`);
        });
    });

    class DiffInfoTestBuilder extends DiffInfoBuilder {
        constructor(public filePath: string, public diffLineNos: number[]) {
            super();
        }
        public build(): DiffInfo {
            return new DiffInfo(this);
        }
    }
});
