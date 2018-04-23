import { ChangeFileList } from './../../app/git/model/change-file-list';
import { ChangeFile } from './../../app/git/model/change-file';
import { capture } from 'ts-mockito/lib/ts-mockito';
import { mock, instance, reset, when, anyString } from 'ts-mockito';
import { GitCommand } from '../../app/git/repository/git-command';
import * as assert from 'assert';

describe('ChangeFileResolver', () => {
    let mockCommand: GitCommand;
    let resolver: ChangeFileList;

    describe('resolve()', () => {
        afterEach(() => {
            reset(mockCommand);
        });
        it('削除ステータスのファイルは対象から外れること', () => {
            // prepare
            const revisions = [
                {
                    revision: '1st-revision', files: [
                        { status: 'A', name: 'src/app/add.ts' },
                        { status: 'M', name: 'src/app/modify.ts' },
                        { status: 'D', name: 'src/app/delete.ts' },
                        { status: 'R', name: 'src/app/rename.ts' },
                        { status: 'C', name: 'src/app/copy.ts' },
                    ],
                },
            ];

            // execute
            resolver = createInstance('from-branch', 'to-branch', revisions);

            // assert
            const results = resolver.getFiles();
            assert(results.length === 4);
            assertChangeFile(results[0], '1st-revision', 'src/app/add.ts', 'A');
            assertChangeFile(results[1], '1st-revision', 'src/app/modify.ts', 'M');
            assertChangeFile(results[2], '1st-revision', 'src/app/rename.ts', 'R');
            assertChangeFile(results[3], '1st-revision', 'src/app/copy.ts', 'C');
        });

        it('複数コミットに同一ファイルがある場合、新しいコミットのみ残ること', () => {
            // prepare
            const revisions = [
                {
                    revision: '3rd-revision', files: [
                        { status: 'A', name: 'src/app/hoge.ts' },
                        { status: 'M', name: 'src/app/page.ts' },
                    ],
                }, {
                    revision: '2nd-revision', files: [
                        { status: 'A', name: 'src/app/page.ts' },
                        { status: 'M', name: 'src/app/foo.ts' },
                    ],
                },
                {
                    revision: '1st-revision', files: [
                        { status: 'A', name: 'src/app/foo.ts' },
                        { status: 'M', name: 'src/app/bar.ts' },
                    ],
                },
            ];

            // execute
            resolver = createInstance('from-branch', 'to-branch', revisions);

            // assert
            const results = resolver.getFiles();
            assert(results.length === 4);
            assertChangeFile(results[0], '3rd-revision', 'src/app/hoge.ts', 'A');
            assertChangeFile(results[1], '3rd-revision', 'src/app/page.ts', 'M');
            assertChangeFile(results[2], '2nd-revision', 'src/app/foo.ts', 'M');
            assertChangeFile(results[3], '1st-revision', 'src/app/bar.ts', 'M');
        });

        it('更新ファイルが存在しない場合', () => {
            // prepare
            const revisions: any = [];

            // execute
            resolver = createInstance('from-branch', 'to-branch', revisions);

            // assert
            assert(resolver.getFiles().length === 0);
        });

        function assertChangeFile(changeFile: ChangeFile, revision: string, name: string, status: string) {
            assert(changeFile.getRevision() === revision);
            assert(changeFile.getName() === name);
            assert(changeFile.getStatus() === status);
        }

        function createInstance(fromBranch: string, toBranch: string, revisionInfos: IRevisionInfo[]) {
            mockCommand = mock(GitCommand);
            const revisions = revisionInfos.map((revisionInfo) => revisionInfo.revision);
            when(mockCommand.getRevisions(fromBranch, toBranch)).thenReturn(revisions);
            revisionInfos.forEach((revisionInfo, revisionIdx) => {
                const revision = revisionInfo.revision;
                const prev = (revisionIdx !== revisions.length - 1) ? revisions[revisionIdx + 1] : fromBranch;
                const files = revisionInfo.files.map((file) => {
                    return `${file.status}\t${file.name}`;
                });
                when(mockCommand.getDiffFiles(prev, revision)).thenReturn(files);
            });

            process.env.BEGIN_REVISION = fromBranch;
            process.env.END_REVISION = toBranch;
            const result = new ChangeFileList(instance(mockCommand));
            return result;
        }
    });
});

interface IRevisionInfo {
    revision: string;
    files: IFileInfo[];
}

interface IFileInfo {
    name: string;
    status: string;
}
