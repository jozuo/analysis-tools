import { Commit } from './../model/commit';
import { DiffInfoList } from './../diff-info-list';
import { RequestWrapper } from './request-wrapper';
import { DiffInfo, DiffInfoBuilder } from './../model/diff-info';
import { Env } from './../../env';
import { AbstractRepository } from './abstract-repository';
import * as path from 'path';

const INTERVAL_MILL_SEC = 200;

export class CommitDiffRepository extends AbstractRepository {
    private request = new RequestWrapper();

    public async getDiffInfoList(commitHash: string): Promise<DiffInfoList> {
        return new Promise<DiffInfoList>((resolve, reject) => {
            setTimeout(() => {
                const endpoint = Env.getGitLabAPIEndPoint();
                const token = Env.getGitLabToken();
                const options = {
                    uri: endpoint + path.join('/repository/commits', commitHash || '', 'diff'),
                    proxy: process.env.PROXY || undefined,
                    headers: {
                        'PRIVATE-TOKEN': token,
                    },
                };

                this.request.get(options).then((response) => {
                    resolve(this.parse(response));
                }).catch((error) => {
                    console.log(this.handleError(error));
                    reject('GET operation failed.');
                });
            }, INTERVAL_MILL_SEC);
        });
    }

    private parse(response: string): DiffInfoList {
        const diffInfos = JSON.parse(response)
            .filter((block: any) => {
                return !block.deleted_file;
            }).map((json: any) => {
                return new DiffInfoBuilder().setJson(json).build();
            });

        return new DiffInfoList(diffInfos);
    }
}
