/**
 * gitlab-commit-status
 *   arg1: status
 *   arg2: description (optional)
 *   arg3: coverage (optional)
 */
import { CommitStatusRepository } from './gitlab/repository/commit-status-repository';

const statuses = ['running', 'success', 'failed'];
if (process.argv.length !== 3) {
    throw Error('Illegal arguments.');
}

const commitState = process.argv[2];
const description = (process.argv.length >= 4) ? process.argv[3] : undefined;
const coverage = (process.argv.length >= 5) ? Number(process.argv[4]) : undefined;

if (statuses.indexOf(commitState) < 0) {
    throw Error(`illegal argument. state=[${commitState}]`);
}

const repository = new CommitStatusRepository();
repository.post(commitState, description, coverage).then(() => {
    console.log('done');
    process.exit(0);
}).catch((error) => {
    console.log(error);
    process.exit(9);
});
