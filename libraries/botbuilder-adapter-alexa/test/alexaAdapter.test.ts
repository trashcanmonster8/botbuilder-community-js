import { AdapterAlexa } from '../src';
import { notEqual, rejects, equal, deepEqual } from 'assert';
import { Activity, WebRequest, WebResponse } from 'botbuilder';
import { TurnContext, ResourceResponse, ActivityTypes } from 'botbuilder-core';
import { IntentRequest } from 'ask-sdk-model';
import { basicIntentRequest, basicEndSession } from './constants';

describe('Tests for Alexa Adapter', (): void => {
    let alexaAdapter: AdapterAlexa;
    const emptyActivity: Partial<Activity> = {};
    
    function turnContext(activity: Partial<Activity>): TurnContext {
        return new TurnContext(alexaAdapter, activity);
    }

    before((): void => {
        alexaAdapter = new AdapterAlexa();
    });

    it('should create instance of Alexa Adapter', (): void => {
        notEqual(alexaAdapter, undefined);
    });

    it('should not update activities', async (): Promise<void> => {
        await rejects(async (): Promise<void> => {
            await alexaAdapter.updateActivity(turnContext(emptyActivity), emptyActivity);
        });
    });

    it('should not update activities', async (): Promise<void> => {
        await rejects(async (): Promise<void> => {
            await alexaAdapter.deleteActivity(turnContext(emptyActivity), emptyActivity);
        });
    });

    describe('sendActivites', (): void => {
        const activity: Partial<Activity> = {
            id: 'test'
        };

        it('should list resource responses', async (): Promise<void> => {
            const responses: ResourceResponse[] = await alexaAdapter.sendActivities(turnContext(activity), [activity]);
            deepEqual(responses, [{id: 'test'}]);
        });
    });

    describe('processActivity', (): void => {
        let alexaRequest: WebRequest;
        let alexaResponse: WebResponse;

        beforeEach((): void => {
            alexaRequest = {
                headers: {},
                on: (): void => {}
            };
            alexaResponse = {
                end(): void {},
                send(): void {},
                status(): void {}
            };
        });
        
        it('should return 404 if no response activities are created for conversation', async (): Promise<void> => {
            alexaRequest.body = basicIntentRequest;
            alexaResponse.status = (status: number): void => {
                equal(status, 404);
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (_context: TurnContext): Promise<void> => {});
        });
    });
});