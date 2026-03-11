import { RequestData } from 'mediatr-ts';

export class CreateEmployeeCommand extends RequestData<string> {
    constructor(
        public readonly name: string,
        public readonly email_address: string,
        public readonly phone_number: string,
        public readonly gender: 'Male' | 'Female',
        public readonly cafe_id?: string // UUID of the assigned cafe
    ) {
        super();
    }
}