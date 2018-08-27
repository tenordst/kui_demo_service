import {Sensor} from "./sensor";

export class Session {
    public sensor_values: Sensor[];

    private currentHeartrate: number;
    private currentTemperature: number;
    private currentHumidity: number;

    constructor (private length: number) {
        this.sensor_values = new Array(0);

        this.currentHeartrate = 100;
        this.currentTemperature = 80;
        this.currentHumidity = 70;

        for (var i = 0; i < length; i++) {

            this.currentHeartrate = this.randomIntFromInterval(this.currentHeartrate, 0, 3);
            this.currentTemperature = this.randomIntFromInterval(this.currentHeartrate, 0, 1);
            this.currentHumidity = this.randomIntFromInterval(this.currentHeartrate, 0, 2);

            // Making sure humidity stays under 100
            if (this.currentHumidity > 100) this.currentHumidity = 100;

            this.sensor_values.push(new Sensor(this.currentTemperature, this.currentHumidity, this.currentHeartrate));
        }
    }

    private randomIntFromInterval(init: number, min: number, max: number)
    {
        let delta = Math.floor(Math.random()*(max-min+1)+min);

        if (Math.random() < 0.5) {
            delta *= -1;
        }

        return init + delta;
    }
}