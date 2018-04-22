export class RevisionInfo {
    private file: string;
    private revision: string;

    constructor(line: string) {
        if (line.split(',').length < 2) {
            throw Error(`line=[${line}] is illegal.`);
        }
        this.file = line.split(',')[0].trim();
        this.revision = line.split(',')[1].trim();
    }

    public getFile(): string {
        return this.file;
    }

    public getRevision(): string {
        return this.revision;
    }
}
