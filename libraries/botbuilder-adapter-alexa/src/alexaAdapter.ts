import {
    BotAdapter,
    ConversationReference,
    TurnContext,
    Activity,
    ResourceResponse,
    WebRequest,
    WebResponse,
    ActivityTypes
} from 'botbuilder';
import { RequestEnvelope } from 'ask-sdk-model';
import { createAskSdkError } from 'ask-sdk-core';
import { retrieveBody } from './util';
import { AlexaActivity } from './alexaActivity';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export class AdapterAlexa extends BotAdapter {
    private responses: Map<string, Activity[]> = new Map<string, Activity[]>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async continueConversation(_reference: Partial<ConversationReference>, _logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteActivity(_context: TurnContext, _reference: Partial<ConversationReference>): Promise<void> {
        throw new Error(`deleteActivity is not implemented for ${ AdapterAlexa.name }`);
    }

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const resourceResponses: ResourceResponse[] = [];
        const key = this.createKey(context);
        this.responses.set(key, activities as Activity[]);
        for (const activity of activities) {
            resourceResponses.push({
                id: activity.id || ''
            });
        }

        return resourceResponses;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async updateActivity(_context: TurnContext, _activity: Partial<Activity>): Promise<void> {
        throw new Error(`updateActivity is not implemented for ${ AdapterAlexa.name }`);
    }

    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        const alexaRequest: RequestEnvelope = await retrieveBody(req);
        const activity: Partial<Activity> = AlexaActivity.createActivity(alexaRequest);
        const context: TurnContext = this.createContext(activity);
        await this.runMiddleware(context, logic);

        const key = this.createKey(context);
        const activities: Activity[] | undefined = this.responses.get(key);
        if (activities !== undefined) {
            const activity: Activity | undefined = activities.shift();
            if (activity !== undefined) {
                if (activity.type === ActivityTypes.Message) {
                    res.status(200);
                    res.send({
                        version: '1.0',
                        response: {
                            outputSpeech: {
                                type: 'PlainText',
                                text: activity.text || ''
                            }
                        }
                    });
                } else if (activity.type === ActivityTypes.EndOfConversation) {
                    res.status(200);
                    res.send({
                        version: '1.0',
                        response: {
                            shouldEndSession: true
                        }
                    });
                }
                this.responses.delete(key);
            }
        } else {
            res.status(404);
            res.send(createAskSdkError('AlexaAdapter', 'Could not get activity from'));
        }

        res.end();
    }

    private createKey(context: TurnContext): string {
        let conversationId = '';
        if (context.activity.conversation !== undefined) {
            conversationId = context.activity.conversation.id;
        }

        let activityId = '';
        if (context.activity.id !== undefined) {
            activityId = context.activity.id;
        }

        return `${ conversationId }:${ activityId }`;
    }

    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }
}