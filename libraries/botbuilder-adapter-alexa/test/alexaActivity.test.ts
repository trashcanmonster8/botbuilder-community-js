import { deepEqual, equal } from 'assert';
import { AlexaActivity } from '../src/alexaActivity';
import { basicIntentRequest } from './constants';
import { ActivityTypes, Activity } from 'botbuilder';

describe('alexa activity', (): void => {
    let alexaActivity: AlexaActivity;

    describe('intent request', (): void => {
        before((): void => {
            alexaActivity =  new AlexaActivity(basicIntentRequest);
        });

        it('should return alexa request', (): void => {
            deepEqual(alexaActivity.envelope, basicIntentRequest);
        });
        
        it('should return message activity', (): void => {
            const activity: Activity = alexaActivity.getActivity() as Activity;
            equal(ActivityTypes.Message, activity.type);
        });
    })
});