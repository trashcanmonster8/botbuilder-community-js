import { Responder } from '../src/responder';
import { throws } from 'assert';

describe('responder', (): void => {
    it('should create alexa error when no response activities are created', (): void => {
        throws((): void => {
            new Responder([]);
        })
    });
})