import { Responder } from '../src/responder';
import { throws, deepEqual } from 'assert';
import { ActivityTypes, Activity } from 'botbuilder';
import { ResponseEnvelope } from 'ask-sdk-model';

describe('responder', (): void => {
    it('should create alexa error when no response activities are created', (): void => {
        throws((): void => {
            new Responder([]);
        });
    });

    describe('single response', (): void => {
        it('creates plain text response', (): void => {
            const test = 'foo bar';
            const activity: Partial<Activity> = {
                type: ActivityTypes.Message,
                text: test
            };
            const responder: Responder = new Responder([activity as Activity]);
            const response: ResponseEnvelope = {
                version: '1.0',
                response: {
                    outputSpeech: {
                        type: 'PlainText',
                        text: test
                    }
                }
            }
            deepEqual(responder.getResponse(), response);
        })
    });
})