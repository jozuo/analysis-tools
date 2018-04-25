import * as childProcess from 'child_process';
const exec = childProcess.execSync;

export class GitCommand {
    private path: string;

    constructor(path: string) {
        this.path = path;
        console.log('========== debug ==========');
        console.log(`path: ${path}`);
        console.log('========== debug ==========');
    }

    public getDiffFiles(from: string, to: string): string[] {
        const command = `git diff --name-status ${from}..${to}`;
        return exec(command, { cwd: this.path }).toString().split('\n');
    }

    public getRevisions(from: string, to: string): string[] {
        const command = `git log --pretty=format:%H ${from}..${to}`;
        return exec(command, { cwd: this.path }).toString().split('\n');
    }
}
