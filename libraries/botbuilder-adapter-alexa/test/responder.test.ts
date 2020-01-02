import { Responder } from '../src/responder';
import { throws, deepEqual } from 'assert';
import { ActivityTypes, Activity } from 'botbuilder';
import { ResponseEnvelope } from 'ask-sdk-model';
import { AlexaApi } from '../src';

describe('responder', (): void => {
    let responder: Responder;
    let response: ResponseEnvelope;

    it('should create alexa error when no response activities are created', (): void => {
        throws((): void => {
            new Responder([]);
        });
    });

    describe('single response', (): void => {
        let activity: Partial<Activity>;

        it('creates plain text response', (): void => {
            const test = 'foo bar';
            activity = {
                type: ActivityTypes.Message,
                text: test
            };
            responder = new Responder([activity as Activity]);
            response = {
                version: AlexaApi.version,
                response: {
                    outputSpeech: {
                        type: 'PlainText',
                        text: test
                    }
                }
            }
            deepEqual(responder.getResponse(), response);
        });

        it('creates end of session request', (): void => {
            activity = {
                type: ActivityTypes.EndOfConversation
            };
            responder = new Responder([activity as Activity]);
            response = {
                version: AlexaApi.version,
                response: {
                    shouldEndSession: true
                }
            };
            deepEqual(responder.getResponse(), response);
        });

        it('throws error if the activity is not recognized for alexa', (): void => {
            activity = {
                type: 'unknownActivity'
            };
            responder = new Responder([activity as Activity]);
            throws((): void => {
                responder.getResponse();
            });
        });
    });
})