import { RequestData } from 'mediatr-ts';

export class CreateCafeCommand extends RequestData<string> {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly location: string,
        public readonly logo?: Buffer // Optional logo implementation 
    ) {
        super();
    }
}