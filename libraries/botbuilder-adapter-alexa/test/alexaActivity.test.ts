import { deepEqual, equal, ok, strictEqual } from 'assert';
import { AlexaActivity, AlexaChannel } from '../src/alexaActivity';
import { basicIntentRequest, basicEndSession } from './constants';
import { ActivityTypes, Activity, ChannelAccount, ConversationAccount } from 'botbuilder';
import { IntentRequest, RequestEnvelope, Session } from 'ask-sdk-model';

describe('alexa activity', (): void => {
    let request: RequestEnvelope = basicIntentRequest;
    let activity: Partial<Activity>;

    describe('any request', (): void => {
        const alexaActivity: AlexaActivity = new AlexaActivity(request);

        before((): void => {
            activity = alexaActivity.getActivity();
        })

        it('should return alexa request', (): void => {
            deepEqual(alexaActivity.envelope, request);
        });
        
        it('should return alexa channel', (): void => {
            equal(activity.channelId, AlexaChannel.channelId);
        });

        it('should return service url', (): void => {
            ok((activity.serviceUrl as string).includes(request.context.System.apiEndpoint));
        });

        it('should identify the user', (): void => {
            const expected: ChannelAccount = {
                id: request.context.System.user.userId,
                name: AlexaChannel.userName
            };
            deepEqual(activity.from, expected)
        });

        it('should identify the conversation', (): void => {
            const session: Session = request.session as Session;
            equal((activity.conversation as ConversationAccount).id, session.sessionId);
        });

        it('should create new session', (): void => {
            ok((alexaActivity.envelope.session as Session).new);
        });

        it('should return recipient as alexa skill', (): void => {
            const expected: ChannelAccount = {
                id: request.context.System.application.applicationId,
                name: AlexaChannel.recipientName
            }
            deepEqual(activity.recipient, expected)
        });
    })

    describe('intent request', (): void => {
        const intent: IntentRequest = (basicIntentRequest.request as IntentRequest);

        before((): void => {
            request = basicIntentRequest;
            activity = (new AlexaActivity(request)).getActivity();
        });
        
        it('should return message activity', (): void => {
            equal(activity.type, ActivityTypes.Message);
        });
        
        it('should return intent as text', (): void => {
            equal(activity.text, intent.intent.name);
        });
        
        it('should return locale', (): void => {
            equal(activity.locale, intent.locale)
        });
    });

    describe('end of session request', (): void => {
        before((): void => {
            request = basicEndSession;
            activity = (new AlexaActivity(request)).getActivity();
        });

        it('should be an end of conversation type', (): void => {
            equal(activity.type, ActivityTypes.EndOfConversation);  
        })
    })
});