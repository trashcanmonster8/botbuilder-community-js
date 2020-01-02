import { Middleware, TurnContext } from 'botbuilder';
import { RequestEnvelope } from 'ask-sdk-model';
import { getSlotValue } from 'ask-sdk-core';

export interface AlexaIntentRequestToMessageActivityMiddlewareSettings {
    intentSlotName: string;
}

export class AlexaIntentRequestToMessageActivityMiddleware implements Middleware {

    protected readonly settings: AlexaIntentRequestToMessageActivityMiddlewareSettings;

    public constructor(settings: AlexaIntentRequestToMessageActivityMiddlewareSettings) {
        const defaultSettings: AlexaIntentRequestToMessageActivityMiddlewareSettings = {
            intentSlotName: 'phrase'
        };

        this.settings = { ...defaultSettings, ...settings };
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {

        if (context.activity.channelId !== 'alexa') {
            return await next();
        }

        const alexaRequest: RequestEnvelope = context.activity.channelData;

        if (alexaRequest.request.type !== 'IntentRequest') {
            return await next();
        }

        const intentValue = getSlotValue(alexaRequest, this.settings.intentSlotName);
        context.activity.text = intentValue;

        await next();
    }

}