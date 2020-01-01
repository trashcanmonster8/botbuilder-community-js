import { RequestEnvelope } from 'ask-sdk-model';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export class AlexaActivity {
    private readonly request: RequestEnvelope;

    public constructor(request: RequestEnvelope) {
        this.request = request;
    }

    public get envelope(): RequestEnvelope {
        return this.request;
    }
}