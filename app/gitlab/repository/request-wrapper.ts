import * as request from 'request-promise-native';
import { Env } from '../env';

export class RequestWrapper {
    public async get(options: any) {
        if (Env.isDebugEnable()) {
            console.log('GET operation.');
            console.log(JSON.stringify(options));
        }
        return request.get(options);
    }
    public async post(options: any) {
        if (Env.isDebugEnable()) {
            console.log('POST operation.');
            console.log(JSON.stringify(options));
        }
        return request.post(options);
    }
}
