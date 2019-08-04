import { Activity, ActivityTypes, BotAdapter, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse } from 'botbuilder';
import * as alexa from 'ask-sdk-core';

/**
 * @module botbuildercommunity/adapter-alexa
 */


/**
 * Settings used to configure a `AlexaAdapter` instance.
 */
export interface AlexaAdapterSettings {
}


export enum AlexaActivityTypes {
}

/**
 * Bot Framework Adapter for [Twilio Whatsapp](https://www.twilio.com/whatsapp)
 */
export class AlexaAdapter extends BotAdapter {

    protected readonly settings: AlexaAdapterSettings;
    protected readonly client: any;
    protected readonly channel: string = 'alexa';

    /**
     * Creates a new AlexaAdapter instance.
     * @param settings configuration settings for the adapter.
     */
    public constructor(settings: AlexaAdapterSettings) {
        super();

        this.settings = settings;

        try {

        } catch (error) {
            throw new Error(`AlexaAdapter.constructor(): ${error.message}.`);
        }
    }

    /**
     * Sends a set of outgoing activities to the appropriate channel server.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param activities List of activities to send.
     */
    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];

        for (let i = 0; i < activities.length; i++) {
            const activity: Partial<Activity> = activities[i];

            switch (activity.type) {
                case 'delay':
                    await delay(typeof activity.value === 'number' ? activity.value : 1000);
                    responses.push({} as ResourceResponse);
                    break;
                case ActivityTypes.Message:
                    if (!activity.conversation || !activity.conversation.id) {
                        throw new Error(`AlexaAdapter.sendActivities(): Activity doesn't contain a conversation id.`);
                    }

                    // eslint-disable-next-line no-case-declarations
                    const message = this.parseActivity(activity);

                    // try {
                    //     const res: MessageInstance = await this.client.messages.create(message);
                    //     responses.push({ id: res.sid });
                    // } catch (error) {
                    //     throw new Error(`AlexaAdapter.sendActivities(): ${error.message}.`);
                    // }

                    break;
                default:
                    responses.push({} as ResourceResponse);
                    console.warn(`AlexaAdapter.sendActivities(): Activities of type '${activity.type}' aren't supported.`);
            }
        }

        return responses;
    }

    /**
     * Transform Bot Framework Activity to a Twilio Message.
     * 
     * @param activity Activity to transform
     */
    protected parseActivity(activity: Partial<Activity>): any {

        const message = activity;

        return message;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error('Method not supported by Alexa API.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error('Method not supported by Alexa API.');
    }

    /**
     * Resume a conversation with a user, possibly after some time has gone by.
     *
     * @param reference A `ConversationReference` saved during a previous incoming activity.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     */
    public async continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
        const request: Partial<Activity> = TurnContext.applyConversationReference(
            { type: 'event', name: 'continueConversation' },
            reference,
            true
        );

        const context: TurnContext = this.createContext(request);

        return this.runMiddleware(context, logic);
    }

    /**
     * Processes an incoming request received by the bots web server into a TurnContext.
     *
     * @param req An Express or Restify style Request object.
     * @param res An Express or Restify style Response object.
     * @param logic A function handler that will be called to perform the bots logic after the received activity has been pre-processed by the adapter and routed through any middleware for processing.
     */
    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {

        // Validate if requests are coming from Twilio
        // https://www.twilio.com/docs/usage/security#validating-requests
        if (!req.headers && (!req.headers['x-twilio-signature'] || !req.headers['X-Twilio-Signature'])) {
            console.warn(`AlexaAdapter.processActivity(): request doesn't contain a Twilio Signature.`);
            res.status(401);
            res.end();
        }

        const message = await retrieveBody(req);

        if (!message) {
            res.status(400);
            res.end();
        }

        // const isTwilioRequest = Twilio.validateRequest(authToken, signature, requestUrl, message);

        // if (!isTwilioRequest) {
        //     console.warn(`AlexaAdapter.processActivity(): request doesn't contain a valid Twilio Signature.`);

        //     res.status(401);
        //     res.end();
        // }

        // Handle events
        const activity: Partial<Activity> = {
            id: message.MessageSid,
            timestamp: new Date(),
            channelId: this.channel,
            conversation: {
                id: message.From,
                isGroup: false, // Supported by WhatsApp, not supported by Twilio API yet.
                conversationType: null,
                tenantId: null,
                name: ''
            },
            from: {
                id: message.From,
                name: '' // Supported by WhatsApp, not supported by Twilio API yet.
            },
            recipient: {
                id: message.To,
                name: ''
            },
            text: message.Body,
            channelData: message,
            localTimezone: null,
            callerId: null,
            serviceUrl: null,
            listenFor: null,
            label: message.MessagingServiceSid,
            valueType: null,
            type: null
        };

        // Create a Conversation Reference
        const context: TurnContext = this.createContext(activity);

        context.turnState.set('httpStatus', 200);
        await this.runMiddleware(context, logic);

        // Send http response back
        res.status(context.turnState.get('httpStatus'));
        if (context.turnState.get('httpBody')) {
            res.send(context.turnState.get('httpBody'));
        } else {
            res.end();
        }
    }

    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }

    /**
     * Allows for the overriding of the Twilio object in unit tests and derived adapters.
     * @param accountSid Twilio AccountSid
     * @param authToken Twilio Auth Token
     */
    protected createAlexaClient(): any {
        return {};
    }

}

/**
 * Retrieve body from WebRequest
 * @private
 * @param req incoming web request
 */
function retrieveBody(req: WebRequest): Promise<any> {
    return new Promise((resolve: any, reject: any): void => {

        if (req.body) {
            try {
                resolve(req.body);
            } catch (err) {
                reject(err);
            }
        } else {
            let requestData = '';
            req.on('data', (chunk: string): void => {
                requestData += chunk;
            });
            req.on('end', (): void => {
                try {
                    req.body = JSON.parse(requestData);

                    resolve(req.body);
                } catch (err) {
                    reject(err);
                }
            });
        }
    });
}

// Copied from `botFrameworkAdapter.ts` to support {type: 'delay' } activity.
function delay(timeout: number): Promise<void> {
    return new Promise((resolve): void => {
        setTimeout(resolve, timeout);
    });
}