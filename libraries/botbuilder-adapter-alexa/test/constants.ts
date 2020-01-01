import { RequestEnvelope, SessionEndedRequest, Context, IntentRequest, Session } from 'ask-sdk-model';

const context: Context = {
    System: {
        application: {
            applicationId: 'id'
        },
        user: {
            userId: 'user'
        },
        apiEndpoint: 'alexa.amazon.com'
    }
};
const session: Session = {
    new: false,
    sessionId: 'sessionId',
    user: context.System.user,
    application: context.System.application
}
const intentRequest: IntentRequest = {
    type: 'IntentRequest',
    requestId: '1234',
    timestamp: 'time',
    dialogState: 'COMPLETED',
    intent: {
        name: 'myIntent',
        confirmationStatus: 'NONE'
    },
    locale: 'en-US'
};
const sessionEndRequest: SessionEndedRequest = {
    'type': 'SessionEndedRequest',
    'requestId': '123',
    'timestamp': 'time',
    'reason': 'USER_INITIATED'
};
export const basicIntentRequest: RequestEnvelope = {
    version: '1.0',
    context: context,
    request: intentRequest
};
export const basicEndSession: RequestEnvelope = {
    version: '1.0',
    session: session,
    context: context,
    request: sessionEndRequest
};