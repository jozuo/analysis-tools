import { RequestWrapper } from './request-wrapper';
import { CommitFile } from './../model/commit-file';
import { DiffInfo, DiffInfoBuilder } from './../model/diff-info';
import { Env } from './../env';
import * as path from 'path';
import { AbstractRepository } from './abstract-repository';

const INTERVAL_MILL_SEC = 200;

export class CommitDiffRepository extends AbstractRepository {
    private currentRevision: string | undefined;
    private diffInfos: DiffInfo[] = [];
    private request = new RequestWrapper();

    public async getDiffInfo(commitFile: CommitFile): Promise<DiffInfo> {
        // APIアクセスを抑えるため、リビジョンが変わった場合のみ取得する
        if (this.diffInfos.length === 0 || this.currentRevision !== commitFile.getRevision()) {
            this.diffInfos = await this.getDiffInfos(commitFile.getRevision());
            this.currentRevision = commitFile.getRevision();
        }
        return this.diffInfos.filter((diffInfo) => {
            return diffInfo.getPath() === commitFile.getPath();
        })[0];
    }

    private async getDiffInfos(revision: string): Promise<DiffInfo[]> {
        return new Promise<DiffInfo[]>((resolve, reject) => {
            setTimeout(() => {
                const endpoint = Env.getGitLabAPIEndPoint();
                const token = Env.getGitLabToken();
                const options = {
                    uri: endpoint + path.join('/repository/commits', revision || '', 'diff'),
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

    private parse(response: string): DiffInfo[] {
        return JSON.parse(response)
            .filter((block: any) => {
                return !block.deleted_file;
            }).map((json: any) => {
                return new DiffInfoBuilder().setJson(json).build();
            });
    }
}
