import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

import { Sensor } from "./sensor";
import { Session } from "./session";

export const getLatest: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  console.log(`Incoming request for ${event.httpMethod}, path ${event.path}, function ${context.functionName}`);

  let latestValue = getSensorValue();

  const response = {
      statusCode: 200,
      body: JSON.stringify(latestValue),
  };

  cb(null, response);
}

function getSensorValue(): Sensor {
  return new Sensor(77,89, 128);
}

export const getSession: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  console.log(`Incoming request for ${event.httpMethod}, path ${event.path}, function ${context.functionName}`);

  let identityid = "undefined";
  let sessionid = "undefined";

  if (context.identity != undefined) {
    identityid = context.identity.cognitoIdentityId;
  }

  if (event.pathParameters != undefined) {
    sessionid = event.pathParameters.id;
  }

  let session = getSessionForUser(identityid, sessionid);

  const response = {
      statusCode: 200,
      body: JSON.stringify( session.sensor_values ),
  };

  cb(null, response);
}

function getSessionForUser(identityId: string, sessionId: string): Session {
  console.log(`Fetching session for user ${identityId}, session id ${sessionId}`);
  return new Session(100);
}