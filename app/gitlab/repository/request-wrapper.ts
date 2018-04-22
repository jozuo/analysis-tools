import * as request from 'request-promise-native';

export class RequestWrapper {
    public async get(options: any) {
        return request.get(options);
    }
    public async post(options: any) {
        return request.post(options);
    }
}
