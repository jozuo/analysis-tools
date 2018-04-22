import { RevisionInfo } from './revision-info';
import * as fs from 'fs';

export class RevisionInfoList {
    private revisionInfos: RevisionInfo[] = [];

    constructor(filePath: string) {
        const data = fs.readFileSync(filePath, 'UTF-8');
        if (data.trim().length === 0) {
            throw Error(`file is empty.`);
        }
        this.revisionInfos = data.split('\n').map((line) => {
            return new RevisionInfo(line);
        });
    }

    public getRevision(file: string): string {
        const files = this.revisionInfos.filter((revisionInfo) => {
            return revisionInfo.getFile() === file;
        });
        if (files.length !== 1) {
            throw new Error(`file [${file}] match ${files.length} times.`);
        }
        return files[0].getRevision();
    }
}
