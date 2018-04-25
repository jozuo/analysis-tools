import { DiffInfo } from './model/diff-info';
export class DiffInfoList {

    private diffInfos: DiffInfo[];

    constructor(diffInfos: DiffInfo[]) {
        this.diffInfos = diffInfos;
    }

    public getDiffInfo(filePath: string): DiffInfo {
        return this.diffInfos.filter((diffInfo) => {
            return diffInfo.getFilePath() === filePath;
        })[0];
    }

    public isModifiedLine(filePath: string, lineNo: number): boolean {
        return this.diffInfos.filter((diff) => {
            return diff.getFilePath() === filePath;
        })[0].isModifiedLine(lineNo);
    }
}
