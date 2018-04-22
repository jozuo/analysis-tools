import { CommitCommentRepository } from './../repository/commit-comment-repository';
import { DiffInfo } from './diff-info';
import { CommitComment } from './commit-comment';

export class CommitFile {
    private path: string;
    private revision: string;
    private commitComments: CommitComment[] = [];
    private diffInfo?: DiffInfo;
    private repository = new CommitCommentRepository();

    constructor(path: string, revision: string) {
        this.path = path;
        this.revision = revision;
    }

    // 本当はコンストラクタで設定したいが、コンストラクタで非同期処理のレスポンスを
    // 利用する方法が分からないので、やむを得ずsetterを利用
    public setDiffInfo(diffInfo: DiffInfo): void {
        this.diffInfo = diffInfo;
    }

    public getPath(): string {
        return this.path;
    }

    public getRevision(): string {
        return this.revision;
    }

    public isSamePath(path: string): boolean {
        return this.path === path;
    }

    public add(line: string): void {
        this.commitComments.push(new CommitComment(this, line));
    }

    public compareTo(other: CommitFile) {
        const result = this.revision.localeCompare(other.getRevision());
        if (result !== 0) {
            return result;
        }
        return this.path.localeCompare(other.getPath());
    }

    public getSummaryMessage(): string | undefined {
        const extraComments = this.commitComments
            .filter((commitComment) => {
                return !commitComment.isInModifiedLine(this.getDiffIInfo());
            });

        const count = extraComments.length;
        if (count === 0) {
            return undefined;
        }

        let result = `#### ${count} extra issue\n`;
        result += `\n`;
        result += `Note: The following issues were found on lines that were not modified in the commit. `;
        result += `Because these issues can't be reported as line comments, they are summarized here:\n`;
        result += `\n`;
        result += extraComments.map((commitComment) => {
            return commitComment.getSummaryMessage();
        }).reduce((prev, current) => {
            return `${prev}\n${current}`;
        });
        return result;
    }

    public async postComment(): Promise<boolean> {
        await this.postIndividualComment(this.getDiffIInfo());
        await this.repository.postSummaryComment(this);
        return true;
    }

    private getDiffIInfo(): DiffInfo {
        if (!this.diffInfo) {
            throw Error('diff info is not define.');
        }
        return this.diffInfo;
    }

    private async postIndividualComment(diffInfo: DiffInfo): Promise<void> {
        const individualComments = this.commitComments
            .filter((commitComment) => {
                return commitComment.isInModifiedLine(diffInfo);
            });
        for (const individualComment of individualComments) {
            await this.repository.postIndividualComment(individualComment);
        }
    }
}
