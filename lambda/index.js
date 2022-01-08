/* *
 * This sample demonstrates handling intents for an Alexa skill implementing the AudioPlayer interface using the Alexa Skills Kit SDK (v2).
 * This sample works using the default DynamoDB table associated with an Alexa-hosted skill - you will need to use this with a hosted skill,
 * or you use your own DynamoDB table in the request and response interceptors.
 * Please visit https://github.com/alexa-samples for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const Util = require('./util.js');

const r2d2Sounds = ['url1',
'url2',
'Url3',
'Url4']

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hola soy R2 D2, pregunta lo que quieras';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/**
 * Intent handler to start playing an audio file.
 * By default, it will play a specific audio stream.
 * */
const PlayAudioIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayAudioIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent');
    },
    
    handle(handlerInput) {
        const audioFile = '<audio src="'+randomPhrase(r2d2Sounds)+'" /> Quieres algo mas?';
        const speechText = `${audioFile}`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt("Quieres algo mas?")
            .getResponse();
    }
 
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Soy un robot de starwars muy conocido, pregunta lo que quieras';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Adios!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


/* *
 * SystemExceptions can be triggered if there is a problem with the audio that is trying to be played.
 * This handler will log the details of the exception and can help troubleshoot issues with audio playback.
 * */
const SystemExceptionHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`System exception encountered: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
  },
};

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Enviaste esto ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento no te entendi, vuelve a preguntar.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* HELPER FUNCTIONS */

async function getPlaybackInfo(handlerInput) {
  const attributes = await handlerInput.attributesManager.getPersistentAttributes();
  return attributes.playbackInfo;
}

async function setPlaybackInfo(handlerInput, playbackInfoObject) {
  await handlerInput.attributesManager.setPersistentAttributes({
      playbackInfo: playbackInfoObject
      });
}




function randomPhrase(myData) {
// the argument is an array [] of words or phrases
var i = 0;
i = Math.floor(Math.random() * myData.length);
return(myData[i]);

}

// Request and response interceptors using the DynamoDB table associated with Alexa-hosted skills

const LoadPersistentAttributesRequestInterceptor = {
  async process(handlerInput) {
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();

    /**
     * Check if user is invoking the skill the first time and initialize preset values
        playbackInfo: {
              offsetInMilliseconds - this is used to set the offset of the audio file 
                        to save the position between sessions
              token - save an audio token for this play session
              inPlaybackSession - used to record the playback state of the session
              hasPreviousPlaybackSession - used to help confirm previous playback state
            }
    */
    if (Object.keys(persistentAttributes).length === 0) {
      handlerInput.attributesManager.setPersistentAttributes({
        playbackInfo: {
          offsetInMilliseconds: 0,
          token: 'sample-audio-token',
          inPlaybackSession: false,
          hasPreviousPlaybackSession: false,
        },
      });
    }
  },
};

const SavePersistentAttributesResponseInterceptor = {
  async process(handlerInput) {
    await handlerInput.attributesManager.savePersistentAttributes();
  },
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayAudioIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SystemExceptionHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(LoadPersistentAttributesRequestInterceptor)
    .addResponseInterceptors(SavePersistentAttributesResponseInterceptor)
    .withCustomUserAgent('sample/audioplayer-nodejs/v2.0')
    .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter({
            tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
            createTable: false,
            dynamoDBClient: new AWS.DynamoDB({apiVersion: 'latest', region: process.env.DYNAMODB_PERSISTENCE_REGION})
        })
    )
    .lambda();