"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const ms_rest_azure_1 = require("ms-rest-azure");
const azure_cognitiveservices_textanalytics_1 = require("azure-cognitiveservices-textanalytics");
/**
 * @module botbuildercommunity/text-analytics
 */
class EntityExtraction {
    constructor(serviceKey, endpoint, options) {
        this.serviceKey = serviceKey;
        this.endpoint = endpoint;
        this.options = options;
        this.credentials = new ms_rest_azure_1.CognitiveServicesCredentials(serviceKey);
        this.client = new azure_cognitiveservices_textanalytics_1.TextAnalyticsClient(this.credentials, endpoint, options);
    }
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type === botbuilder_1.ActivityTypes.Message) {
                const input = {
                    documents: [
                        {
                            "id": "1",
                            "text": context.activity.text
                        }
                    ]
                };
                try {
                    const result = yield this.client.entities(input);
                    const l = result.documents[0].entities;
                    context.turnState.set("textEntities", l);
                }
                catch (e) {
                    throw new Error(`Failed to process entities on ${context.activity.text}. Error: ${e}`);
                }
            }
            yield next();
        });
    }
}
exports.EntityExtraction = EntityExtraction;
//# sourceMappingURL=entity.js.map