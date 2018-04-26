export class ChangeFile {
    private commitHash: string;
    private name: string;
    private status: string;

    constructor(commitHash: string, name: string, status: string) {
        this.commitHash = commitHash;
        this.name = name;
        this.status = status;
    }

    public getCommitHash(): string {
        return this.commitHash;
    }

    public getName(): string {
        return this.name;
    }

    public getStatus(): string {
        return this.status;
    }
}
