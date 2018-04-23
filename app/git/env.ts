export class Env {
    public static getBeginRevision(): string {
        if (!process.env.BEGIN_REVISION) {
            throw new Error('BEGIN_REVISION is not defined.');
        }
        return process.env.BEGIN_REVISION;
    }

    public static getEndRevision(): string {
        if (!process.env.END_REVISION) {
            throw new Error('END_REVISION is not defined.');
        }
        return process.env.END_REVISION;
    }
}
