import { Range } from './../../../app/gitlab/model/range';
import { DiffInfo, DiffInfoBuilder } from './../../../app/gitlab/model/diff-info';
import { CommitComment } from './../../../app/gitlab/model/commit-comment';
import { CommitFile } from './../../../app/gitlab/model/commit-file';
import * as assert from 'assert';

describe('CommitComment', () => {
    let commitFile: CommitFile;
    before(() => {
        commitFile = new CommitFile('path string', 'revision string');
    });
    describe('constructor', () => {
        it('引数が不正な場合1', () => {
            try {
                const commitComment = new CommitComment(commitFile, 'hoge');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'line=[hoge] is illegal.');
            }
        });
        it('引数が不正な場合2', () => {
            try {
                const commitComment = new CommitComment(commitFile, 'hoge,page');
                assert.fail('エラーになるはず');
            } catch (error) {
                assert(error.message === 'line=[hoge,page] is illegal.');
            }
        });
    });
    describe('Getter', () => {
        let instance: CommitComment;

        it('getFilePath()', () => {
            const line = '"file path", 123, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.getFilePath() === 'path string');
        });
        it('getRevision()', () => {
            const line = '"file path", 123, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.getRevision() === 'revision string');
        });
        it('getLineNo()', () => {
            const line = '"file path", 123, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.getLineNo() === 123);
        });
        it('getGitLabBlobUrl()', () => {
            process.env.GITLAB_URL = 'http://localhost/toru/professional-tool';
            process.env.GITLAB_PROJECT_ID = '1';
            const line = '"file path", 123, "comment message"';
            instance = new CommitComment(commitFile, line);

            const expected = 'http://localhost/toru/professional-tool/blob/revision string/path string/#L123';
            assert(instance.getGitLabBlobUrl() === expected);
        });
    });
    describe('isInModifiedLine()', () => {
        let instance: CommitComment;
        let diffInfo: DiffInfo;

        before(() => {
            const ranges = [new Range(10, 20), new Range(30, 40)];
            diffInfo = new DiffInfoTestBuilder('path string', ranges).build();
        });
        it('行番号がDiff範囲1よりも小さい場合', () => {
            const line = '"file path", 9, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.isInModifiedLine(diffInfo) === false);
        });
        it('行番号がDiff範囲1の下限の場合', () => {
            const line = '"file path", 10, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.isInModifiedLine(diffInfo) === true);
        });
        it('行番号がDiff範囲1の上限の場合', () => {
            const line = '"file path", 20, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.isInModifiedLine(diffInfo) === true);
        });
        it('行番号がDiff範囲1の上限よりも大きい場合', () => {
            const line = '"file path", 21, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.isInModifiedLine(diffInfo) === false);
        });
        it('行番号がDiff範囲2よりも小さい場合', () => {
            const line = '"file path", 29, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.isInModifiedLine(diffInfo) === false);
        });
        it('行番号がDiff範囲2の下限の場合', () => {
            const line = '"file path", 30, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.isInModifiedLine(diffInfo) === true);
        });
        it('行番号がDiff範囲2の上限の場合', () => {
            const line = '"file path", 40, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.isInModifiedLine(diffInfo) === true);
        });
        it('行番号がDiff範囲2の上限よりも大きい場合', () => {
            const line = '"file path", 41, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.isInModifiedLine(diffInfo) === false);
        });
    });
    describe('getIndividualMessage()', () => {
        let instance: CommitComment;

        it('最低限の引数の場合', () => {
            const line = '"file path", 123, "comment message"';
            instance = new CommitComment(commitFile, line);
            assert(instance.getIndividualMessage() === ':no_entry_sign: comment message');
        });
        it('レベルwarning指定されている場合', () => {
            const line = '"file path", 123, "comment message", "warning"';
            instance = new CommitComment(commitFile, line);
            assert(instance.getIndividualMessage() === ':warning: comment message');
        });
        it('レベルerror指定されている場合', () => {
            const line = '"file path", 123, "comment message", "no_entry_sign"';
            instance = new CommitComment(commitFile, line);
            assert(instance.getIndividualMessage() === ':no_entry_sign: comment message');
        });
        it('レベルで指定値以外が指定されている場合', () => {
            const line = '"file path", 123, "comment message", "hoge"';
            instance = new CommitComment(commitFile, line);
            assert(instance.getIndividualMessage() === ':no_entry_sign: comment message');
        });
        it('ルール名が指定されている場合', () => {
            const line = '"file path", 123, "comment message", , "rule name string"';
            instance = new CommitComment(commitFile, line);
            assert(instance.getIndividualMessage() === ':no_entry_sign: comment message(rule name string)');
        });
        it('ルールURLが指定されている場合', () => {
            const line = '"file path", 123, "comment message", , ,"http://localhost/hoge/"';
            instance = new CommitComment(commitFile, line);
            const expected = ':no_entry_sign: comment message [:blue_book:](http://localhost/hoge/)';
            assert(instance.getIndividualMessage() === expected);
        });
    });
    describe('getSummaryMessage()', () => {
        const GITLAB_URL = 'http://localhost/toru/professional-tool';
        const GITLAB_PROJECT_ID = '1';
        const GITLAB_BLOB_URL = 'http://localhost/toru/professional-tool/blob/revision string/path string/#L123';

        beforeEach(() => {
            process.env.GITLAB_URL = GITLAB_URL;
            process.env.GITLAB_PROJECT_ID = GITLAB_PROJECT_ID;
        });
        it('最低限の引数の場合', () => {
            const line = '"file path", 123, "comment message"';
            const result = new CommitComment(commitFile, line).getSummaryMessage();
            assert(result === `1. [:no_entry_sign: comment message](${GITLAB_BLOB_URL})`);
        });
        it('レベルwarning指定されている場合', () => {
            const line = '"file path", 123, "comment message", "warning"';
            const result = new CommitComment(commitFile, line).getSummaryMessage();
            assert(result === `1. [:warning: comment message](${GITLAB_BLOB_URL})`);
        });
        it('レベルerror指定されている場合', () => {
            const line = '"file path", 123, "comment message", "error"';
            const result = new CommitComment(commitFile, line).getSummaryMessage();
            assert(result === `1. [:no_entry_sign: comment message](${GITLAB_BLOB_URL})`);
        });
        it('レベルで指定値以外が指定されている場合', () => {
            const line = '"file path", 123, "comment message", "hoge"';
            const result = new CommitComment(commitFile, line).getSummaryMessage();
            assert(result === `1. [:no_entry_sign: comment message](${GITLAB_BLOB_URL})`);
        });
        it('ルール名が指定されている場合', () => {
            const line = '"file path", 123, "comment message", , "rule name string"';
            const result = new CommitComment(commitFile, line).getSummaryMessage();
            assert(result === `1. [:no_entry_sign: comment message(rule name string)](${GITLAB_BLOB_URL})`);
        });
        it('ルールURLが指定されている場合', () => {
            const line = '"file path", 123, "comment message", , ,"http://localhost/hoge/"';
            const result = new CommitComment(commitFile, line).getSummaryMessage();

            const ruleUrl = '[:blue_book:](http://localhost/hoge/)';
            assert(result === `1. [:no_entry_sign: comment message](${GITLAB_BLOB_URL}) ${ruleUrl}`);
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
