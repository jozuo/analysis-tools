import * as fs from 'fs';
import { CommitDiffRepository } from './../repository/commit-diff-repository';
import { Commit } from './commit';

export class CommitList {
    private commits: Commit[] = [];

    constructor(commentFilePath: string) {
        const lines = fs.readFileSync(commentFilePath, 'UTF-8').split('\n');
        lines.filter((line) => {
            return line.trim().length > 0;
        }).forEach((line, index) => {
            const commitHash = this.getCommitHash(line);
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
        const results = this.commits.filter((commit) => {
            return (commit.getHash() === commitHash);
        });
        return (results.length > 0) ? results[0] : undefined;
    }

    private getCommitHash(line: string): string {
        return line.split(',')[0].replace(/^"/, '').replace(/"$/, '');
    }
}
