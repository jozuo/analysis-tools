import { AbstractRepository } from '../../../app/gitlab/repository/abstract-repository';
import * as assert from 'assert';

describe('AbstractRepository', () => {
    let repository: AbstractRepository;

    beforeEach(() => {
        repository = new AbstractRepositoryWrapper();
    });
    describe('handleError()', () => {
        it('response.optionsが存在しない場合', () => {
            const input = { hogehoge: 'pagepage' };
            assert(((repository as any).handleError(input)) === input);
        });
        it('response.optionsは存在するが response.statusCodeは存在しない場合', () => {
            const input = { options: { method: 'GET' } };
            assert(((repository as any).handleError(input)) === input);
        });
        it('response.optionsとresponse.statusCodeが存在する場合', () => {
            const input = {
                options: { method: 'GET' },
                statusCode: 404,
                error: '{ "error": "404 Not Found" }',
            };

            let expect = '';
            expect += '--- request ---\n';
            expect += '{"method":"GET"}\n';
            expect += '--- response ---\n';
            expect += '{"statusCode":404,"message":"{\\"error\\":\\"404 Not Found\\"}"}\n';
            assert(((repository as any).handleError(input)) === expect);
        });
    });
});

class AbstractRepositoryWrapper extends AbstractRepository {
}
