import { Middleware, TurnContext } from "botbuilder";
import { CognitiveServicesCredentials } from "ms-rest-azure";
import { TextAnalyticsClient } from "azure-cognitiveservices-textanalytics";
/**
 * @module botbuildercommunity/text-analytics
 */
export declare class LanguageDetection implements Middleware {
    serviceKey: string;
    endpoint: string;
    options?: any;
    credentials: CognitiveServicesCredentials;
    client: TextAnalyticsClient;
    constructor(serviceKey: string, endpoint: string, options?: any);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
}
