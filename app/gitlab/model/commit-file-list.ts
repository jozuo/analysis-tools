import { CommitDiffRepository } from './../repository/commit-diff-repository';
import { CommitFile } from './commit-file';
import { RevisionInfoList } from './revision-info-list';

export class CommitFileList {
    private commitFiles: CommitFile[] = [];
    private filePaths: string[] = [];

    constructor(lines: string[], revisionList: RevisionInfoList) {
        let prevFile: CommitFile;
        let currentFile: CommitFile;

        lines.filter((line) => {
            return line.trim().length > 0;
        }).forEach((line, index) => {
            const filePath = this.getFilePath(line);
            if (!currentFile || (prevFile && !prevFile.isSamePath(filePath))) {
                this.checkAlreadyExist(filePath);
                currentFile = new CommitFile(filePath, revisionList.getRevision(filePath));
                this.commitFiles.push(currentFile);
            }
            currentFile.add(line);
            prevFile = currentFile;
        });

        this.commitFiles.sort((obj1, obj2) => {
            return obj1.compareTo(obj2);
        });
    }

    public async postComment(): Promise<void> {
        const repository = new CommitDiffRepository();
        for (const commitFile of this.commitFiles) {
            commitFile.setDiffInfo(await repository.getDiffInfo(commitFile));
            await commitFile.postComment();
        }
    }

    private checkAlreadyExist(filePath: string): void {
        if (this.filePaths.indexOf(filePath) >= 0) {
            throw Error('file path is not sorted.');
        }
        this.filePaths.push(filePath);
    }

    private getFilePath(line: string): string {
        return line.split(',')[0].replace(/^"/, '').replace(/"$/, '');
    }
}
