import { RequestEnvelope } from 'ask-sdk-model';
import { Activity, ActivityTypes } from 'botbuilder';

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

    public getActivity(): Partial<Activity> {
        return {
            type: ActivityTypes.Message
        }
    }
}