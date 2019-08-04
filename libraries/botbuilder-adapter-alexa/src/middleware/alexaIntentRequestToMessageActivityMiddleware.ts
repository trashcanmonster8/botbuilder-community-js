import { Middleware, TurnContext } from 'botbuilder';
import { RequestEnvelope, IntentRequest } from 'ask-sdk-model';

export class AlexaIntentRequestToMessageActivityMiddleware implements Middleware {

    constructor() {
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {

        if (context.activity.channelId !== 'alexa') {
            return await next();
        }

        const alexaRequest: RequestEnvelope = context.activity.channelData;

        if (alexaRequest.request.type !== 'IntentRequest') {
            return await next();
        }

        const alexaIntentRequest: IntentRequest = alexaRequest.request;

        if (alexaIntentRequest.intent.slots && alexaIntentRequest.intent.slots['phrase']) {
            context.activity.text = alexaIntentRequest.intent.slots['phrase'].value;
        }

        await next();
    }

}