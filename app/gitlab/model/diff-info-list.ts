import { DiffInfo } from './diff-info';

export class DiffInfoList {
    private diffInfos: DiffInfo[];

    constructor(diffInfos: DiffInfo[]) {
        this.diffInfos = diffInfos;
    }

    public isModifiedLine(filePath: string, lineNo: number): boolean {
        const diffInfo = this.diffInfos.filter((diff) => {
            return diff.getFilePath() === filePath;
        })[0];

        if (!diffInfo) {
            return false;
        }

        return diffInfo.isModifiedLine(lineNo);
    }
}
