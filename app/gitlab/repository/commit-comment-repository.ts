import { RequestWrapper } from './request-wrapper';
import { CommitComment } from './../model/commit-comment';
import { CommitFile } from './../model/commit-file';
import { Env } from './../env';
import { AbstractRepository } from './abstract-repository';
import * as path from 'path';

const INTERVAL_MILLI_SEC = 200;

export class CommitCommentRepository extends AbstractRepository {

    private request: RequestWrapper = new RequestWrapper();

    public async postSummaryComment(commitFile: CommitFile): Promise<boolean> {
        const summaryMessage = commitFile.getSummaryMessage();
        if (summaryMessage) {
            await this.post(
                commitFile.getRevision(),
                summaryMessage,
                commitFile.getPath(),
            );
            return true;
        }
        return false;
    }

    public async postIndividualComment(commitComment: CommitComment): Promise<boolean> {
        await this.post(
            commitComment.getRevision(),
            commitComment.getIndividualMessage(),
            commitComment.getFilePath(),
            commitComment.getLineNo());
        return true;
    }

    private async post(revision: string, comment: string, filePath: string, lineNo?: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                const endpoint = Env.getGitLabAPIEndPoint();
                const token = Env.getGitLabToken();

                const options = {
                    uri: endpoint + path.join('/repository/commits', revision, 'comments'),
                    proxy: process.env.PROXY || undefined,
                    headers: {
                        'PRIVATE-TOKEN': token,
                    },
                    form: {
                        note: comment,
                        path: filePath,
                        line: lineNo || -1,
                        line_type: 'new',
                    },
                };
                this.request.post(options).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    console.log(this.handleError(error));
                    reject('POST operation failed.');
                });
            }, INTERVAL_MILLI_SEC);
        });
    }
}
