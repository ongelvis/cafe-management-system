import { RequestData } from 'mediatr-ts';

export class GetEmployeesQuery extends RequestData<any[]> {
    constructor(public readonly cafeName?: string) {
        super();
    }
}