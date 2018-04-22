import { ChangeFileResolver, GitCommand } from '../../app/git/change-file-resolver';
import { mock, instance, reset, when } from 'ts-mockito';
import * as assert from 'assert';

describe('変更ファイル抽出', () => {
    let mockCommand: GitCommand;
    let resolver: ChangeFileResolver;

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
        resolver.resolve();

        // assert
        const result = JSON.parse(resolver.toString());
        assert(result.total === 4);
        assertLine(result, 0, '1st-revision', 'src/app/add.ts', 'A');
        assertLine(result, 1, '1st-revision', 'src/app/modify.ts', 'M');
        assertLine(result, 2, '1st-revision', 'src/app/rename.ts', 'R');
        assertLine(result, 3, '1st-revision', 'src/app/copy.ts', 'C');
    });

    it('複数コミットに同一ファイルがある場合、新しいコミットのみ残ること', () => {
        // prepare
        const revisions = [
            {
                revision: '3rd-revision', files: [
                    { status: 'A', name: 'src/app/hoge.ts' },
                    { status: 'M', name: 'src/app/page.ts' },
                ],
            },
            {
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
        resolver.resolve();

        // assert
        const result = JSON.parse(resolver.toString());
        assert(result.total === 4);
        assertLine(result, 0, '3rd-revision', 'src/app/hoge.ts', 'A');
        assertLine(result, 1, '3rd-revision', 'src/app/page.ts', 'M');
        assertLine(result, 2, '2nd-revision', 'src/app/foo.ts', 'M');
        assertLine(result, 3, '1st-revision', 'src/app/bar.ts', 'M');
    });

    function assertLine(result: any, idx: number, revision: string, name: string, status: string) {
        assert(result.items[idx].revision === revision);
        assert(result.items[idx].name === name);
        assert(result.items[idx].status === status);
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
        const result = new ChangeFileResolver('', fromBranch, toBranch);
        result.setGitCommand(instance(mockCommand));
        return result;
    }
});

interface IRevisionInfo {
    revision: string;
    files: IFileInfo[];
}

interface IFileInfo {
    name: string;
    status: string;
}
