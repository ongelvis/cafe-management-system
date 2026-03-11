import { RequestData } from 'mediatr-ts';

export class GetCafesQuery extends RequestData<any[]> {
    constructor(public readonly location?: string) {
        super();
    }
}