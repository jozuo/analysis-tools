
import * as childProcess from 'child_process';
const exec = childProcess.execSync;

export class ChangeFileResolver {

    private fromBranch: string;
    private toBranch: string;
    private gitCommand: GitCommand;
    private changeFileList?: ChangeFileList;

    constructor(path: string, fromBranch: string, toBranch: string) {
        this.fromBranch = fromBranch;
        this.toBranch = toBranch;
        this.gitCommand = new GitCommand();
        this.gitCommand.setPath(path);
    }

    public resolve(): void {
        const revisions = this.gitCommand.getRevisions(this.fromBranch, this.toBranch);
        this.changeFileList = this.getChangeFileList(revisions);
    }

    public toString(): string {
        return (this.changeFileList) ? this.changeFileList.toString() : '';
    }

    public getFiles(): ChangeFile[] {
        return (this.changeFileList) ? this.changeFileList.getFiles() : [];
    }

    /** for testing */
    public setGitCommand(gitCommand: GitCommand): void {
        this.gitCommand = gitCommand;
    }

    private getChangeFileList(revisions: string[]): ChangeFileList {
        const fileList = new ChangeFileList();
        revisions.forEach((revision, index) => {
            const from = (index === revisions.length - 1) ? this.fromBranch : revisions[index + 1];
            const lines = this.gitCommand.getDiffFiles(from, revision);

            lines.filter((line) => {
                return line.trim().length > 0;
            }).map((line) => {
                return new ChangeFile(revision, line.split('\t')[1].trim(), line.split('\t')[0].trim());
            }).forEach((file) => {
                fileList.add(file);
            });
        });
        return fileList;
    }
}

export class GitCommand {
    private path?: string;

    public setPath(path: string) {
        this.path = path;
    }
    public getDiffFiles(from: string, to: string): string[] {
        const command = `git diff --name-status ${from}..${to}`;
        return exec(command, { cwd: this.path }).toString().split('\n');
    }

    public getRevisions(fromBranch: string, toBranch: string): string[] {
        const command = `git log --pretty=format:%H ${fromBranch}..${toBranch}`;
        return exec(command, { cwd: this.path }).toString().split('\n');
    }
}

class ChangeFileList {
    private names: string[] = [];
    private files: ChangeFile[] = [];

    public add(file: ChangeFile): void {
        if (file.getStatus() === 'D') {
            return;
        }
        if (this.names.indexOf(file.getName()) > 0) {
            return;
        }
        this.files.push(file);
        this.names.push(file.getName());
    }

    public toString(): string {
        let result = '';
        this.files.forEach((file) => {
            if (result.length !== 0) {
                result += ',';
            }
            result += JSON.stringify(file, null, 2);
        });
        return `{ "total": ${this.files.length}, "items": [${result}]}`;
    }

    public getFiles(): ChangeFile[] {
        return this.files;
    }
}

export class ChangeFile {
    private revision: string;
    private name: string;
    private status: string;

    constructor(revision: string, name: string, status: string) {
        this.revision = revision;
        this.name = name;
        this.status = status;
    }

    public getRevision(): string {
        return this.revision;
    }

    public getName(): string {
        return this.name;
    }

    public getStatus(): string {
        return this.status;
    }
}

// new ChangeFileResolver().execute('origin/add_static_analysys', 'origin/test');
