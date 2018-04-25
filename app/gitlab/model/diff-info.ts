import { Range } from './range';

export class DiffInfo {
    private filePath: string;
    private ranges: Range[] = [];

    constructor(builder: DiffInfoBuilder) {
        this.filePath = builder.filePath || '';
        this.ranges = builder.ranges;
    }

    public getFilePath(): string {
        return this.filePath;
    }

    public getRanges(): Range[] {
        return this.ranges;
    }

    public isModifiedLine(lineNo: number): boolean {
        const result = this.ranges.filter((range) => range.isInside(lineNo));
        return result.length !== 0;
    }
}

export class DiffInfoBuilder {
    public filePath?: string;
    public ranges: Range[] = [];

    private json: any;

    public setJson(json: any): DiffInfoBuilder {
        this.json = json;
        return this;
    }

    public build(): DiffInfo {
        this.filePath = this.json.new_path;
        const matches = this.json.diff.toString().match(/@@ -(\d+?),(\d+?) \+(\d+?),(\d+?) @@/g);
        if (matches) {
            this.ranges = matches.map((lineInfo: any) => {
                const begin = Number(lineInfo.match(/\+(\d+?),(\d+?) /g)[0].split(',')[0].replace('+', ''));
                const end = begin + Number(lineInfo.match(/\+(\d+?),(\d+?) /g)[0].split(',')[1]);
                return new Range(begin, end);
            });
        }
        return new DiffInfo(this);
    }
}
