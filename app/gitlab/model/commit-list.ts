import { CommitDiffRepository } from './../repository/commit-diff-repository';
import { Commit } from './commit';
import * as fs from 'fs';

export class CommitList {
    private commits: Commit[] = [];
    private filePaths: string[] = [];

    constructor(commentFilePath: string) {
        const lines = fs.readFileSync(commentFilePath, 'UTF-8').split('\n');
        lines.filter((line) => {
            return line.trim().length > 0;
        }).forEach((line, index) => {
            const commitHash = line.split(',')[0];
            let commit = this.getCommit(commitHash);
            if (!commit) {
                commit = new Commit(commitHash);
                this.commits.push(commit);
            }
            commit.add(line);
        });
    }

    public async postComment(): Promise<void> {
        const repository = new CommitDiffRepository();
        for (const commit of this.commits) {
            commit.setDiffInfoList(await repository.getDiffInfoList(commit.getHash()));
            await commit.postComment();
        }
    }

    private getCommit(commitHash: string): Commit | undefined {
        this.commits.forEach((commit) => {
            if (commit.getHash() === commitHash) {
                return commit;
            }
        });
        return undefined;
    }

    private checkAlreadyExist(filePath: string): void {
        if (this.filePaths.indexOf(filePath) >= 0) {
            throw Error('file path is not sorted.');
        }
        this.filePaths.push(filePath);
    }

    private getFilePath(line: string): string {
        return line.split(',')[0].replace(/^"/, '').replace(/"$/, '');
    }
}
