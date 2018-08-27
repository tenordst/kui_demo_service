
import { DynamoDB } from 'aws-sdk';

export class Sensor {
    constructor(public temperature: number, public humidity: number, public heartrate: number) {

    }

    
}
