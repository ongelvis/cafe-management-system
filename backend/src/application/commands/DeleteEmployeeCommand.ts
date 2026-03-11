import { RequestData } from 'mediatr-ts';

export class DeleteEmployeeCommand extends RequestData<void> {
    constructor(public readonly id: string) {
        super();
    }
}