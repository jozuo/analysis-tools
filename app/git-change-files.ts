/**
 * git-change-files
 *   arg1: workspace path
 *   arg2: from branch
 *   arg3: to branch
 */
import { ChangeFileResolver, ChangeFile } from './git/change-file-resolver';
import * as fs from 'fs';
import * as path from 'path';

function outputFiles(files: ChangeFile[], dir: string): void {
    const data = files.map((file) => {
        return file.getName();
    }).reduce((prev, current) => {
        return `${prev}\n${current}`;
    });
    fs.writeFileSync(path.join(dir, './file.txt'), data);
}

function outputFileRevisions(files: ChangeFile[], dir: string): void {
    const data = files.map((file) => {
        return `${file.getName()},${file.getRevision()}`;
    }).reduce((prev, current) => {
        return `${prev}\n${current}`;
    });
    fs.writeFileSync(path.join(dir, './file-revision.txt'), data);
}

if (process.argv.length !== 6) {
    throw Error('Illegal arguments.');
}

const sourcePath = process.argv[2];
const fromBranch = process.argv[3];
const toBranch = process.argv[4];
const destPath = process.argv[5];

const resolver = new ChangeFileResolver(sourcePath, fromBranch, toBranch);
resolver.resolve();

const changeFiles = resolver.getFiles();
outputFiles(changeFiles, destPath);
outputFileRevisions(changeFiles, destPath);
