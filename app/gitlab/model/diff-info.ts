import { Range } from './range';

export class DiffInfo {
    private path: string;
    private ranges: Range[] = [];

    constructor(builder: DiffInfoBuilder) {
        this.path = builder.path || '';
        this.ranges = builder.ranges;
    }

    public getPath(): string {
        return this.path;
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
    public path?: string;
    public ranges: Range[] = [];

    private json: any;

    public setJson(json: any): DiffInfoBuilder {
        this.json = json;
        return this;
    }

    public build(): DiffInfo {
        this.path = this.json.new_path;
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
