import { createAskSdkError } from 'ask-sdk-core';
import { Activity } from 'botbuilder';

export class Responder {
    private readonly activites: Activity[];

    public constructor(activities: Activity[]) {
        if (activities.length < 1) {
            throw createAskSdkError('alexaAdapter', 'no response activites created for this request');
        }

        this.activites = activities;
    }
}