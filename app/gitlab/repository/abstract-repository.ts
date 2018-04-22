export abstract class AbstractRepository {
    protected handleError(response: any): string {
        if (!response.options || !response.statusCode) {
            return response;
        }
        let result: string = '';
        result += '--- request ---\n';
        result += JSON.stringify(response.options) + '\n';
        result += '--- response ---\n';
        result += JSON.stringify({
            statusCode: response.statusCode,
            message: JSON.stringify(JSON.parse(response.error)),
        }) + '\n';
        return result;
    }
}
