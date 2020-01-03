import { Activity, ActivityTypes } from 'botbuilder';
import { ResponseEnvelope, Response } from 'ask-sdk-model';
import { AlexaApi } from './alexaApi';
import { alexaAdapterError } from './util';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export class Responder {
    private readonly activites: Activity[];

    public static createResponse(activites: Activity[]): ResponseEnvelope {
        return (new Responder(activites)).getResponse();
    }

    public constructor(activities: Activity[]) {
        if (activities.length < 1) {
            throw alexaAdapterError('no response activites created for this request');
        }

        this.activites = activities;
    }

    public getResponse(): ResponseEnvelope {
        const activity: Activity = this.activites[this.activites.length - 1];
        let response: Response = {
            shouldEndSession: true
        };

        switch (activity.type) {
            case (ActivityTypes.Message): {
                response = {
                    outputSpeech: {
                        type: 'PlainText',
                        text: activity.text
                    }
                };
                break;
            }
            case (ActivityTypes.EndOfConversation): {
                break;
            }
            default: {
                throw alexaAdapterError('unknown activity');
            }
        }

        return {
            version: AlexaApi.version,
            response: response
        };
    }
}