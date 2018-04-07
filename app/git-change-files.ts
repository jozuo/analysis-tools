/**
 * git-change-files
 *   arg1: workspace path
 *   arg2: from branch
 *   arg3: to branch
 */
import { ChangeFileResolver } from './git/change-file-resolver';

if (process.argv.length !== 5) {
    throw Error('Illegal arguments.');
}

const path = process.argv[2];
const fromBranch = process.argv[3];
const toBranch = process.argv[4];

const resolver = new ChangeFileResolver(path, fromBranch, toBranch);
resolver.resolve();
console.log(resolver.toString());