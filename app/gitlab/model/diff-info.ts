import * as jsdiff from 'diff';

export class DiffInfo {
    private filePath: string;
    private diffLineNos: number[] = [];

    constructor(builder: DiffInfoBuilder) {
        this.filePath = builder.filePath || '';
        this.diffLineNos = builder.diffLineNos;
    }

    public getFilePath(): string {
        return this.filePath;
    }

    public isModifiedLine(lineNo: number): boolean {
        return this.diffLineNos.some((diffLineNo) => diffLineNo === lineNo);
    }
}

export class DiffInfoBuilder {
    public filePath?: string;
    public diffLineNos: number[] = [];

    private json: any;

    public setJson(json: any): DiffInfoBuilder {
        this.json = json;
        return this;
    }

    public build(): DiffInfo {
        this.filePath = this.json.new_path;

        // 1ファイルの差分抽出
        // ここでは1ファイル毎の差分を扱うので、結果は1つしか無い
        const result = jsdiff.parsePatch(this.json.diff)[0];

        // 対象ファイルの差分情報から、変更行番号を解析
        result.hunks.forEach((hunk) => {
            const startLine = hunk.newStart;
            hunk.lines
                .filter((line) => !line.startsWith('-'))
                .forEach((line, index) => {
                    if (line.startsWith('+')) {
                        this.diffLineNos.push(startLine + index);
                    }
                });
        });
        return new DiffInfo(this);
    }
}
