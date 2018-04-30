import * as assert from 'assert';
import { instance, mock, reset, when } from 'ts-mockito';
import { GitCommand } from '../../app/git/repository/git-command';
import { ChangeFile } from './../../app/git/model/change-file';
import { ChangeFileList } from './../../app/git/model/change-file-list';

describe('ChangeFileResolver', () => {
    let mockCommand: GitCommand;
    let resolver: ChangeFileList;

    describe('resolve()', () => {
        afterEach(() => {
            reset(mockCommand);
        });
        it('削除ステータスのファイルは対象から外れること', () => {
            // prepare
            const commitInfos = [
                {
                    commitHash: '1st-commit-hash', files: [
                        { status: 'A', name: 'src/app/add.ts' },
                        { status: 'M', name: 'src/app/modify.ts' },
                        { status: 'D', name: 'src/app/delete.ts' },
                        { status: 'R', name: 'src/app/rename.ts' },
                        { status: 'C', name: 'src/app/copy.ts' },
                    ],
                },
            ];

            // execute
            resolver = createInstance('from-branch', 'to-branch', commitInfos);

            // assert
            const results = resolver.getFiles();
            assert(results.length === 4);
            assertChangeFile(results[0], '1st-commit-hash', 'src/app/add.ts', 'A');
            assertChangeFile(results[1], '1st-commit-hash', 'src/app/modify.ts', 'M');
            assertChangeFile(results[2], '1st-commit-hash', 'src/app/rename.ts', 'R');
            assertChangeFile(results[3], '1st-commit-hash', 'src/app/copy.ts', 'C');
        });

        it('複数コミットに同一ファイルがある場合、新しいコミットのみ残ること', () => {
            // prepare
            const commitInfos = [
                {
                    commitHash: '3rd-commit-hash', files: [
                        { status: 'A', name: 'src/app/hoge.ts' },
                        { status: 'M', name: 'src/app/page.ts' },
                    ],
                }, {
                    commitHash: '2nd-commit-hash', files: [
                        { status: 'A', name: 'src/app/page.ts' },
                        { status: 'M', name: 'src/app/foo.ts' },
                    ],
                },
                {
                    commitHash: '1st-commit-hash', files: [
                        { status: 'A', name: 'src/app/foo.ts' },
                        { status: 'M', name: 'src/app/bar.ts' },
                    ],
                },
            ];

            // execute
            resolver = createInstance('from-branch', 'to-branch', commitInfos);

            // assert
            const results = resolver.getFiles();
            assert(results.length === 4);
            assertChangeFile(results[0], '3rd-commit-hash', 'src/app/hoge.ts', 'A');
            assertChangeFile(results[1], '3rd-commit-hash', 'src/app/page.ts', 'M');
            assertChangeFile(results[2], '2nd-commit-hash', 'src/app/foo.ts', 'M');
            assertChangeFile(results[3], '1st-commit-hash', 'src/app/bar.ts', 'M');
        });

        it('更新ファイルが存在しない場合', () => {
            // prepare
            const commitInfos: any = [];

            // execute
            resolver = createInstance('from-branch', 'to-branch', commitInfos);

            // assert
            assert(resolver.getFiles().length === 0);
        });

        function assertChangeFile(changeFile: ChangeFile, commitHash: string, name: string, status: string) {
            assert(changeFile.getCommitHash() === commitHash);
            assert(changeFile.getName() === name);
            assert(changeFile.getStatus() === status);
        }

        function createInstance(fromBranch: string, toBranch: string, commitInfos: ICommitInfo[]) {
            mockCommand = mock(GitCommand);
            const commitHashes = commitInfos.map((commitInfo) => commitInfo.commitHash);
            when(mockCommand.getCommits(fromBranch, toBranch)).thenReturn(commitHashes);
            commitInfos.forEach((commitInfo, idx) => {
                const revision = commitInfo.commitHash;
                const prev = (idx !== commitHashes.length - 1) ? commitHashes[idx + 1] : fromBranch;
                const files = commitInfo.files.map((file) => {
                    return `${file.status}\t${file.name}`;
                });
                when(mockCommand.getDiffFiles(prev, revision)).thenReturn(files);
            });

            process.env.COMMIT_HASH_BEGIN = fromBranch;
            process.env.COMMIT_HASH_END = toBranch;
            const result = new ChangeFileList(instance(mockCommand));
            return result;
        }
    });
});

interface ICommitInfo {
    commitHash: string;
    files: IFileInfo[];
}

interface IFileInfo {
    name: string;
    status: string;
}
