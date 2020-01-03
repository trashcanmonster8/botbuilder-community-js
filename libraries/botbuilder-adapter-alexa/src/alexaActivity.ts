import { RequestEnvelope } from 'ask-sdk-model';
import { Activity, ActivityTypes } from 'botbuilder';
import { getRequestType, getIntentName, getLocale, getUserId } from 'ask-sdk-core';
import * as uuid from 'uuid';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export enum AlexaChannel {
    channelId = 'alexa',
    recipientName = 'skill',
    userName = 'user',
    invalidActivity = 'invalidActivity'
}

export class AlexaActivity {
    private readonly request: RequestEnvelope;
    private readonly activity: Partial<Activity>;
    private readonly requestType: string;

    public static createActivity(request: RequestEnvelope): Partial<Activity> {
        return (new AlexaActivity(request)).getActivity();
    }

    public constructor(request: RequestEnvelope) {
        this.request = request;
        this.requestType = getRequestType(request);

        if (request.session === undefined) {
            request.session = {
                new: true,
                sessionId: uuid(),
                user: request.context.System.user,
                application: request.context.System.application
            };
        }

        this.activity = {
            type: AlexaChannel.invalidActivity,
            serviceUrl: request.context.System.apiEndpoint,
            channelId: AlexaChannel.channelId,
            id: uuid(),
            from: {
                id: getUserId(request),
                name: AlexaChannel.userName
            },
            conversation: {
                isGroup: false,
                conversationType: '',
                tenantId: '',
                id: request.session.sessionId,
                name: '',
            },
            recipient: {
                id: request.context.System.application.applicationId,
                name: AlexaChannel.recipientName
            }
        };
    }

    public get envelope(): RequestEnvelope {
        return this.request;
    }

    public getActivity(): Partial<Activity> {
        switch (this.requestType) {
            case 'IntentRequest': {
                this.activity.type = ActivityTypes.Message;
                this.activity.text = getIntentName(this.request);
                this.activity.locale = getLocale(this.request);
                break;
            }
            case 'SessionEndedRequest': {
                this.activity.type = ActivityTypes.EndOfConversation;
                break;
            }
            default:
        }

        return this.activity;
    }
}