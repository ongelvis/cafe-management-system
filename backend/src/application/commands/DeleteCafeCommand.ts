import { RequestData } from 'mediatr-ts';

export class DeleteCafeCommand extends RequestData<void> {
    constructor(public readonly id: string) {
        super();
    }
}