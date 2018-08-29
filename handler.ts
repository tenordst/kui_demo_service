import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as uuid from 'uuid'
import { DynamoDB } from 'aws-sdk'

import { Sensor } from "./sensor";
import { Session } from "./session";

const dynamoDb = new DynamoDB.DocumentClient();

// Getting the latest value
export const getLatest: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  console.log(`Incoming request for ${event.httpMethod}, path ${event.path}, function ${context.functionName}`);

  let deviceId: string;

  if (event.pathParameters != undefined) {
    deviceId = event.pathParameters.deviceId;
    console.log(`Fetching latest value for ${deviceId}`);
    getSensorValue(deviceId, cb);
  } else {
    console.log("Missing device id");
    cb(new Error('Cannot fetch latest sensor value, missing device ID'));
  }
}

function getSensorValue(deviceId: string, cb: Callback): void {
  let sensor: Sensor = new Sensor(77, 89, 128);

  const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
          deviceId: deviceId,
      },
  };

  // fetch sensor info from the database
  dynamoDb.get(params, (error, result) => {
      // handle potential errors
      if (error) {
          console.error(error);
          cb(new Error('Cannot fetch latest sensor value, error fetching data from DynamoDB' + error));
      } else {
          if (result.Item != undefined) {
            sensor = new Sensor(result.Item.temperature, result.Item.humidity, result.Item.co2);
            const response = {
              statusCode: 200,
              body: JSON.stringify(sensor),
            };

            cb(null, response);
          } else {
              cb(new Error('Cannot fetch latest sensor value, unknown device ID, error' + error));
          }
      }
  });
}

// Reading values for a certain session
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


// Storage of latest sensor item to DynamoDB

export const storeLatest = (event: APIGatewayEvent, context: Context, callback: Callback) => {
    const timestamp = new Date().getTime();

    console.log("Received body: " + event.body);

    const data = JSON.parse(event.body);

    if (data == null || data.deviceId == null) {
      console.error('Missing body');
      callback(new Error('Cannot store sensor values, missing body.'));
      return
    }

    console.log("Data parsed " + data.toString());

    let temperature: string = "-";
    let humidity: string = "-";
    let co2: string = "-";
    let devicedId: string = uuid.v1();

    console.log("Setting device id");
    if (data.deviceId) {
      devicedId = data.deviceId;
    }

    console.log("Setting temperature");
    if (data.temperature) {
        temperature = data.temperature;
    }

    console.log("Setting humidity");
    if (data.humidity) {
        humidity = data.humidity;
    }

    console.log("Setting co2");
    if (data.co2) {
        co2 = data.co2;
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            deviceId: devicedId,
            temperature: temperature,
            humidity: humidity,
            co2: co2,
            createdAt: timestamp,
            updatedAt: timestamp
        }
    }

    console.log("Writing item " + JSON.stringify(params.Item));

    // write new temperature values to the database
    dynamoDb.put(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(new Error('Couldn\'t create sensor item.'))
            return
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(params.Item)
        }
        callback(null, response);
    })
}
