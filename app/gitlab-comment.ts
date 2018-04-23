/**
 * gitlab-comment
 *   arg1: revision file path
 *   arg2: comment file path
 */
import { CommitCommentRequester } from './gitlab/commit-comment-requester';

if (process.argv.length !== 4) {
    throw Error('Illegal arguments.');
}

const revisionFilePath = process.argv[2];
const commentFilePath = process.argv[3];

const target = new CommitCommentRequester(revisionFilePath);
target.postComment(commentFilePath).then(() => {
    console.log('done');
    process.exit(0);
}).catch((error) => {
    console.log(error);
    process.exit(9);
});
