export class Range {
    private begin: number;
    private end: number;

    constructor(begin: number, end: number) {
        this.begin = begin;
        this.end = end;
    }

    public isInside(no: number): boolean {
        return (this.begin <= no) && (no <= this.end);
    }
}
