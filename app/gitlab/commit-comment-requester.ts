import { CommitFileList } from './model/commit-file-list';
import { RevisionInfoList } from './model/revision-info-list';
import * as fs from 'fs';

export class CommitCommentRequester {
    private revisionList: RevisionInfoList;

    constructor(revisionFilePath: string) {
        this.revisionList = new RevisionInfoList(revisionFilePath);
    }

    public async postComment(commentFilePath: string): Promise<void> {
        const lines = fs.readFileSync(commentFilePath, 'UTF-8').split('\n');
        const commitFileList = new CommitFileList(lines, this.revisionList);
        await commitFileList.postComment();
    }
}
