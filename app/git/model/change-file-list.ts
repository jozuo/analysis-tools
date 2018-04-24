import { GitCommand } from './../repository/git-command';
import { ChangeFile } from './change-file';
import { Env } from '../../env';

export class ChangeFileList {
    private names: string[] = [];
    private files: ChangeFile[] = [];
    private gitCommand: GitCommand;

    constructor(gitCommand: GitCommand) {
        this.gitCommand = gitCommand;

        const revisions = this.gitCommand.getRevisions(
            Env.getBeginRevision(), Env.getEndRevision());
        this.resolve(revisions);
    }

    public getFiles(): ChangeFile[] {
        return this.files;
    }

    private resolve(revisions: string[]): void {
        revisions.forEach((revision, index) => {
            const from = (index === revisions.length - 1) ? Env.getBeginRevision() : revisions[index + 1];
            const lines = this.gitCommand.getDiffFiles(from, revision);

            lines.filter((line) => {
                return line.trim().length > 0;
            }).map((line) => {
                return new ChangeFile(revision, line.split('\t')[1].trim(), line.split('\t')[0].trim());
            }).forEach((file) => {
                this.add(file);
            });
        });
    }

    private add(file: ChangeFile): void {
        if (file.getStatus() === 'D') {
            return;
        }
        if (this.names.indexOf(file.getName()) > 0) {
            return;
        }
        this.files.push(file);
        this.names.push(file.getName());
    }
}
