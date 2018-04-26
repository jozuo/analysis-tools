import { DiffInfoList } from './diff-info-list';
import { CommitCommentRepository } from './../repository/commit-comment-repository';
import { CommitComment } from './commit-comment';

export class Commit {
    private hash: string;
    private commitComments: CommitComment[] = [];
    private diffInfoList?: DiffInfoList;
    private repository = new CommitCommentRepository();

    constructor(hash: string) {
        this.hash = hash;
    }

    // 本当はコンストラクタで設定したいが、コンストラクタで非同期処理のレスポンスを
    // 利用する方法が分からないので、やむを得ずsetterを利用
    public setDiffInfoList(diffInfoList: DiffInfoList): void {
        this.diffInfoList = diffInfoList;
    }

    public getHash(): string {
        return this.hash;
    }
    public add(line: string): void {
        this.commitComments.push(new CommitComment(this, line));
    }

    public compareTo(other: Commit) {
        const result = this.hash.localeCompare(other.getHash());
    }

    public getSummaryMessage(): string | undefined {
        const extraComments = this.commitComments
            .filter((commitComment) => {
                return !commitComment.isInModifiedLine(this.getDiffIInfoList());
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
        await this.postIndividualComment(this.getDiffIInfoList());
        await this.repository.postSummaryComment(this);
        return true;
    }

    private getDiffIInfoList(): DiffInfoList {
        if (!this.diffInfoList) {
            throw Error('diff info list is not define.');
        }
        return this.diffInfoList;
    }

    private async postIndividualComment(diffInfoList: DiffInfoList): Promise<void> {
        const individualComments = this.commitComments
            .filter((commitComment) => {
                return commitComment.isInModifiedLine(diffInfoList);
            });
        for (const individualComment of individualComments) {
            await this.repository.postIndividualComment(individualComment);
        }
    }
}
