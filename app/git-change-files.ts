/**
 * git-change-files
 *   arg1: workspace path
 *   arg2: from branch
 *   arg3: to branch
 */
import { ChangeFileResolver, ChangeFile } from './git/change-file-resolver';
import * as fs from 'fs';

function outputFiles(files: ChangeFile[]): void {
    const data = files.map((file) => {
        return file.getName();
    }).reduce((prev, current) => {
        return `${prev}\n${current}`;
    });
    fs.writeFileSync('./file.txt', data);
}

function outputFileRevisions(files: ChangeFile[]): void {
    const data = files.map((file) => {
        return `${file.getName()},${file.getRevision()}`;
    }).reduce((prev, current) => {
        return `${prev}\n${current}`;
    });
    fs.writeFileSync('./file-revision.txt', data);
}

if (process.argv.length !== 5) {
    throw Error('Illegal arguments.');
}

const sourcePath = process.argv[2];
const fromBranch = process.argv[3];
const toBranch = process.argv[4];

const resolver = new ChangeFileResolver(sourcePath, fromBranch, toBranch);
resolver.resolve();

const changeFiles = resolver.getFiles();
outputFiles(changeFiles);
outputFileRevisions(changeFiles);
