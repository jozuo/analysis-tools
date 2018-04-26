import * as path from 'path';
import { Env } from './../../env';
import { Commit } from './commit';
import { DiffInfoList } from './diff-info-list';

export class CommitComment {
    private commit: Commit;
    private filePath: string;
    private lineNo: number;
    private message: string;
    private level?: string;
    private ruleName?: string;
    private ruleUrl?: string;

    constructor(commit: Commit, line: string) {
        if (line.split(',').length < 4) {
            throw Error(`line=[${line}] is illegal.`);
        }
        this.commit = commit;
        this.filePath = this.removeComma(line.split(',')[1]);
        this.lineNo = Number(line.split(',')[2].trim());
        this.message = this.removeComma(line.split(',')[3]);
        if (this.isDefine(line, 4)) {
            this.level = this.removeComma(line.split(',')[4]);
        }
        if (this.isDefine(line, 5)) {
            this.ruleName = this.removeComma(line.split(',')[5]);
        }
        if (this.isDefine(line, 6)) {
            this.ruleUrl = this.removeComma(line.split(',')[6]);
        }
    }

    public getFilePath(): string {
        return this.filePath;
    }

    public getCommitHash(): string {
        return this.commit.getHash();
    }

    public getLineNo(): number {
        return this.lineNo;
    }

    public isInModifiedLine(diffInfoList: DiffInfoList): boolean {
        return diffInfoList.isModifiedLine(this.filePath, this.lineNo);
    }

    public getIndividualMessage(): string {
        return `${this.getLevelIcon()}${this.getContents()}${this.getRuleLink()}`;
    }

    public getSummaryMessage(): string {
        return `1. [${this.getLevelIcon()}${this.getContents()}](${this.getGitLabBlobUrl()})${this.getRuleLink()}`;
    }

    private getGitLabBlobUrl(): string {
        return Env.getGitLabUrl()
            + path.join(
                '/blob',
                this.getCommitHash(),
                this.getFilePath(),
                `#L${this.getLineNo()}`);
    }

    private getContents(): string {
        return this.message + ((this.ruleName) ? `(${this.ruleName})` : '');
    }

    private getRuleLink(): string {
        if (!this.ruleUrl) {
            return '';
        }
        return ` [:blue_book:](${this.ruleUrl})`;
    }

    private getLevelIcon(): string {
        const WARNING = ':warning: ';
        const ERROR = ':no_entry_sign: ';
        if (!this.level) {
            return ERROR;
        }
        return this.level.toLowerCase() === 'warning' ? WARNING : ERROR;
    }

    private isDefine(line: string, index: number) {
        return (line.split(',').length >= (index + 1) && line.split(',')[index].trim().length > 0);
    }

    private removeComma(str: string): string {
        return str.trim().replace(/^"/, '').replace(/"$/, '');
    }
}
