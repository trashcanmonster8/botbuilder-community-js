import { deepEqual } from 'assert';
import { AlexaActivity } from '../src/alexaActivity';
import { basicIntentRequest } from './constants';

describe('alexa activity', (): void => {
    let alexaActivity: AlexaActivity;

    describe('intent request', (): void => {
        before((): void => {
            alexaActivity =  new AlexaActivity(basicIntentRequest);
        });

        it('should return alexa request', (): void => {
            deepEqual(alexaActivity.envelope, basicIntentRequest);
        });
    })
});