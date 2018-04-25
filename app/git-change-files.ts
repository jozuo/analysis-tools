/**
 * git-change-files
 *   arg1: workspace path
 *   arg2: dest path
 */
import { ChangeFile } from './git/model/change-file';
import { ChangeFileList } from './git/model/change-file-list';
import { GitCommand } from './git/repository/git-command';
import * as fs from 'fs';
import * as path from 'path';

function outputFileRevisions(files: ChangeFile[], dir: string): void {
    const data = files.map((file) => {
        return `${file.getName()},${file.getRevision()}`;
    }).reduce((prev, current) => {
        return `${prev}\n${current}`;
    });
    fs.writeFileSync(path.join(dir, './diff-file-revision.txt'), data);
}

if (process.argv.length !== 4) {
    throw Error('Illegal arguments.');
}

const sourcePath = process.argv[2];
const destPath = process.argv[3];

const changeFiles = new ChangeFileList(new GitCommand(sourcePath)).getFiles();
outputFileRevisions(changeFiles, destPath);
