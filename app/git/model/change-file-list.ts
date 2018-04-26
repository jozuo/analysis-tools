import { Env } from '../../env';
import { GitCommand } from './../repository/git-command';
import { ChangeFile } from './change-file';

export class ChangeFileList {
    private names: string[] = [];
    private files: ChangeFile[] = [];
    private gitCommand: GitCommand;

    constructor(gitCommand: GitCommand) {
        this.gitCommand = gitCommand;

        const commitHashes = this.gitCommand.getCommits(
            Env.getCommitHashBegin(), Env.getCommitHashEnd());
        this.resolve(commitHashes);
    }

    public getFiles(): ChangeFile[] {
        return this.files;
    }

    private resolve(commitHashes: string[]): void {
        commitHashes.forEach((commitHash, index) => {
            const from = (index === commitHashes.length - 1) ? Env.getCommitHashBegin() : commitHashes[index + 1];
            const lines = this.gitCommand.getDiffFiles(from, commitHash);

            lines.filter((line) => {
                return line.trim().length > 0;
            }).map((line) => {
                return new ChangeFile(commitHash, line.split('\t')[1].trim(), line.split('\t')[0].trim());
            }).forEach((file) => {
                this.add(file);
            });
        });
    }

    private add(file: ChangeFile): void {
        if (file.getStatus() === 'D') {
            return;
        }
        if (this.names.indexOf(file.getName()) >= 0) {
            return;
        }
        this.files.push(file);
        this.names.push(file.getName());
    }
}
