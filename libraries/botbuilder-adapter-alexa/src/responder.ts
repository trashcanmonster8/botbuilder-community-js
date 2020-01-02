import { createAskSdkError } from 'ask-sdk-core';
import { Activity } from 'botbuilder';
import { ResponseEnvelope } from 'ask-sdk-model';
import { AlexaApi } from './alexaApi';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export class Responder {
    private readonly activites: Activity[];

    public constructor(activities: Activity[]) {
        if (activities.length < 1) {
            throw createAskSdkError('alexaAdapter', 'no response activites created for this request');
        }

        this.activites = activities;
    }

    public getResponse(): ResponseEnvelope {
        return {
            version: AlexaApi.version,
            response: {
                outputSpeech: {
                    type: 'PlainText',
                    text: this.activites[this.activites.length - 1].text
                }
            }
        }
    }
}