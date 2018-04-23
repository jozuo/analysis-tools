import { Env } from './../../app/git/env';
import * as assert from 'assert';

describe('Env', () => {
    beforeEach(() => {
        process.env.BEGIN_REVISION = '';
        process.env.END_REVISION = '';
    });
    describe('getBeginRevision()', () => {
        it('環境変数がセットされていない場合', () => {
            assert.throws(() => Env.getBeginRevision(), (error: any) => {
                assert(error.message === 'BEGIN_REVISION is not defined.');
                return true;
            });
        });
        it('環境変数がセットされている場合', () => {
            // prepare
            process.env.BEGIN_REVISION = 'begin-revision';

            // test
            assert(Env.getBeginRevision() === 'begin-revision');
        });
    });
    describe('getEndRevision()', () => {
        it('環境変数がセットされていない場合', () => {
            assert.throws(() => Env.getEndRevision(), (error: any) => {
                assert(error.message === 'END_REVISION is not defined.');
                return true;
            });
        });
        it('環境変数がセットされている場合', () => {
            // prepare
            process.env.END_REVISION = 'end-revision';

            // test
            assert(Env.getEndRevision() === 'end-revision');
        });
    });
});
