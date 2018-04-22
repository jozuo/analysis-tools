import { Env } from './../env';
import { DiffInfo } from './diff-info';
import { CommitFile } from './commit-file';
import { RevisionInfo } from './revision-info';
import * as request from 'request-promise-native';
import * as path from 'path';

export class CommitComment {
    private parent: CommitFile;
    private lineNo: number;
    private message: string;
    private level?: string;
    private ruleName?: string;
    private ruleUrl?: string;

    constructor(parent: CommitFile, line: string) {
        if (line.split(',').length < 3) {
            throw Error(`line=[${line}] is illegal.`);
        }
        this.parent = parent;
        this.lineNo = Number(line.split(',')[1].trim());
        this.message = this.removeComma(line.split(',')[2]);
        if (this.isDefine(line, 3)) {
            this.level = this.removeComma(line.split(',')[3]);
        }
        if (this.isDefine(line, 4)) {
            this.ruleName = this.removeComma(line.split(',')[4]);
        }
        if (this.isDefine(line, 5)) {
            this.ruleUrl = this.removeComma(line.split(',')[5]);
        }
    }

    public getFilePath(): string {
        return this.parent.getPath();
    }

    public getRevision(): string {
        return this.parent.getRevision();
    }

    public getLineNo(): number {
        return this.lineNo;
    }

    public isInModifiedLine(diffInfo: DiffInfo): boolean {
        return diffInfo.isModifiedLine(this.lineNo);
    }

    public getIndividualMessage(): string {
        return `${this.getLevelIcon()}${this.getContents()}${this.getRuleLink()}`;
    }

    public getSummaryMessage(): string {
        return `1. [${this.getLevelIcon()}${this.getContents()}](${this.getGitLabBlobUrl()})${this.getRuleLink()}`;
    }

    /** visible for testing */
    public getGitLabBlobUrl(): string {
        return Env.getGitLabUrl()
            + path.join(
                '/blob',
                this.getRevision(),
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
