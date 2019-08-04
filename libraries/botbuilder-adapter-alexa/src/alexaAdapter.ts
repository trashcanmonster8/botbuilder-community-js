import { Activity, ActivityTypes, BotAdapter, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse, InputHints } from 'botbuilder';
import { RequestEnvelope, Response, ResponseEnvelope } from 'ask-sdk-model';
import { escapeXmlCharacters, getLocale, getUserId, getIntentName } from 'ask-sdk-core';
import { SkillRequestSignatureVerifier } from 'ask-sdk-express-adapter';

/**
 * @module botbuildercommunity/adapter-alexa
 */

/**
 * Settings used to configure a `AlexaAdapter` instance.
 */
export interface AlexaAdapterSettings {
    shouldEndSessionByDefault?: boolean;
    convertBotBuilderCardsToAlexaCards?: boolean;
}


export enum AlexaActivityTypes {
}

/**
 * Bot Framework Adapter for [Twilio Whatsapp](https://www.twilio.com/whatsapp)
 */
export class AlexaAdapter extends BotAdapter {

    protected readonly settings: AlexaAdapterSettings;
    protected readonly verifier: SkillRequestSignatureVerifier;
    protected readonly channel: string = 'alexa';

    /**
     * Creates a new AlexaAdapter instance.
     * @param settings configuration settings for the adapter.
     */
    public constructor(settings?: AlexaAdapterSettings) {
        super();

        const defaultSettings: AlexaAdapterSettings = {
            shouldEndSessionByDefault: true,
            convertBotBuilderCardsToAlexaCards: false
        }

        this.settings = { ...defaultSettings, ...settings };
        this.verifier = new SkillRequestSignatureVerifier();
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
                    const message = this.activityToMessage(activity, context);
                    responses.push({ id: activity.id });

                    break;
                default:
                    responses.push({} as ResourceResponse);
                    console.warn(`AlexaAdapter.sendActivities(): Activities of type '${activity.type}' aren't supported.`);
            }
        }

        return responses;
    }

    /**
     * Transform Bot Framework Activity to a Alexa Response Message.
     * 
     * @param activity Activity to transform
     */
    protected activityToMessage(activity: Partial<Activity>, context: TurnContext): any {

        // Create response
        const response: Response = {};

        // Add SSML or text response
        if (activity.speak) {
            if (!activity.speak.startsWith('<speak>') && !activity.speak.endsWith('</speak>')) {
                activity.speak = `<speak>${activity.speak}</speak>`
            }

            response.outputSpeech = {
                type: 'SSML',
                ssml: activity.speak
            }
        } else {
            response.outputSpeech = {
                type: 'PlainText',
                text: activity.text
            }
        }

        // Handle reprompt

        // Handle cards

        // Handle attachments

        // Add sessionAttributes

        // Tranform inputHint to shouldEndSession
        switch (activity.inputHint) {
            case InputHints.IgnoringInput:
                response.shouldEndSession = true;
                break;
            case InputHints.ExpectingInput:
                response.shouldEndSession = false;
                break;
            case InputHints.AcceptingInput:
            default:
                break;
        }

        // Create response
        const responseEnvelope: ResponseEnvelope = {
            version: '1.0',
            response
        };

        context.turnState.set('httpBody', responseEnvelope);

        return;
    }

    protected requestToActivity(alexaRequestBody: RequestEnvelope): Partial<Activity> {

        const message = alexaRequestBody.request;
        const system = alexaRequestBody.context.System;

        // Handle events
        const activity: Partial<Activity> = {
            id: message.requestId,
            timestamp: new Date(message.timestamp),
            channelId: this.channel,
            conversation: {
                id: alexaRequestBody.session.sessionId,
                isGroup: false,
                conversationType: message.type,
                tenantId: null,
                name: ''
            },
            from: {
                id: getUserId(alexaRequestBody),
                name: ''
            },
            recipient: {
                id: system.application.applicationId,
                name: ''
            },
            locale: getLocale(alexaRequestBody),
            text: message.type === 'IntentRequest' ? getIntentName(alexaRequestBody) : '',
            channelData: alexaRequestBody,
            localTimezone: null,
            callerId: null,
            serviceUrl: `${system.apiEndpoint}?token=${system.apiAccessToken}`,
            listenFor: null,
            label: null,
            valueType: null,
            type: message.type
        };

        // Set Activity Type
        switch (message.type) {

            case 'LaunchRequest':
                activity.type = ActivityTypes.ConversationUpdate;
                break;

            case 'SessionEndedRequest':
                activity.type = ActivityTypes.EndOfConversation;
                break;

            case 'IntentRequest':
                activity.type = ActivityTypes.Message;
                break;

        }

        return activity;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error('Method not supported by Alexa API.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error('Method not supported by Alexa API.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
        throw new Error('Method not supported by Alexa API.');
    }

    /**
     * Processes an incoming request received by the bots web server into a TurnContext.
     *
     * @param req An Express or Restify style Request object.
     * @param res An Express or Restify style Response object.
     * @param logic A function handler that will be called to perform the bots logic after the received activity has been pre-processed by the adapter and routed through any middleware for processing.
     */
    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {

        // Validate if requests are coming from Alexa
        // https://developer.amazon.com/docs/custom-skills/handle-requests-sent-by-alexa.html#request-verify
        if (!req.headers && (!req.headers['signature'] || !req.headers['Signature'])) {
            console.warn(`AlexaAdapter.processActivity(): request doesn't contain an Alexa Signature.`);
            res.status(401);
            res.end();
        }

        const alexaRequestBody: RequestEnvelope = await retrieveBody(req);
        const activity = this.requestToActivity(alexaRequestBody);

        // Verify if request is a valid signed request
        try {
            await this.verifier.verify(JSON.stringify(alexaRequestBody), req.headers);
        }
        catch (error) {
            console.warn(`AlexaAdapter.processActivity(): ${error.message}`);
            res.status(401);
            res.end();
        }

        // Create a Conversation Reference
        const context: TurnContext = this.createContext(activity);

        // Handle session attributes
        if (alexaRequestBody.session.attributes) {
            context.turnState.set('alexaSessionAttributes', alexaRequestBody.session.attributes);
        } else {
            context.turnState.set('alexaSessionAttributes', {});
        }

        context.turnState.set('httpStatus', 200);
        await this.runMiddleware(context, logic);

        // Send HTTP response back
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