/**
 * gitlab-comment
 *   arg2: comment file path
 */
import { CommitList } from './gitlab/model/commit-list';

if (process.argv.length !== 3) {
    throw Error('Illegal arguments.');
}

const commentFilePath = process.argv[3];
new CommitList(commentFilePath).postComment().then(() => {
    console.log('done');
    process.exit(0);
}).catch((error) => {
    console.log(error);
    process.exit(9);
});
