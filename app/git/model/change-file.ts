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
