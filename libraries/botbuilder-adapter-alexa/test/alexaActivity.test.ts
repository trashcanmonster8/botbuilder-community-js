import { RequestEnvelope } from 'ask-sdk-model';
import { deepEqual } from 'assert';
import { AlexaActivity } from '../src/alexaActivity';

describe('alexa activity', (): void => {
    it('should return alexa request', (): void => {
        const alexaRequest: RequestEnvelope = {
            version: '1.0',
            context: {
                System: {
                    application: {
                        applicationId: 'applicationId'
                    },
                    user: {
                        userId: 'userId'
                    },
                    apiEndpoint: 'alexa.amazon.com'
                }
            },
            request: {
                type: 'LaunchRequest',
                requestId: 'requestId',
                timestamp: 'timestamp'
            }
        };
        const alexaActivity: AlexaActivity = new AlexaActivity(alexaRequest);
        deepEqual(alexaActivity.envelope, alexaRequest);
    });
});