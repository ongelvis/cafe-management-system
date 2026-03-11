import { RequestData } from 'mediatr-ts';

export class UpdateEmployeeCommand extends RequestData<void> {
    constructor(
        public readonly id: string, // The UIXXXXXXX ID
        public readonly name: string,
        public readonly email_address: string,
        public readonly phone_number: string,
        public readonly gender: 'Male' | 'Female',
        public readonly cafe_id?: string // New Cafe UUID (optional)
    ) {
        super();
    }
}