import { RequestData } from 'mediatr-ts';

export class UpdateCafeCommand extends RequestData<void> {
    constructor(
        public readonly id: string,         // The UUID of the cafe to update
        public readonly name: string,
        public readonly description: string,
        public readonly location: string,
        public readonly logo?: Buffer | null // Handle optional logo update
    ) {
        super();
    }
}