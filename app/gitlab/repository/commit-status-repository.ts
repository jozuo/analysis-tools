import * as path from 'path';
import { Env } from './../../env';
import { AbstractRepository } from './abstract-repository';
import { RequestWrapper } from './request-wrapper';

const INTERVAL_MILLI_SEC = 200;

export class CommitStatusRepository extends AbstractRepository {
    private request = new RequestWrapper();

    public async post(state: string, description?: string, coverage?: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                const endpoint = Env.getGitLabAPIEndPoint();
                const token = Env.getGitLabToken();
                const commitHash = Env.getCommitHashEnd();

                const options = {
                    uri: endpoint + path.join('/statuses', commitHash),
                    proxy: process.env.PROXY || undefined,
                    headers: {
                        'PRIVATE-TOKEN': token,
                    },
                    form: {
                        state: state,
                        ref: Env.getGitLabBranch(),
                        name: 'jenkins',
                        target_url: Env.getJenkinsBuildUrl(),
                        description: (description) ? description : undefined,
                        coverage: (coverage) ? coverage : undefined,
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
