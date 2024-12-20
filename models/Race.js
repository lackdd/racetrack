const mongoose = require('mongoose');
const { Schema } = mongoose;

const raceSchema = new Schema({
    raceName: { type: String, required: true },
    isOngoing: { type: Boolean, default: false },
    drivers: [
        {
            name: { type: String, required: true },
            car: { type: String, required: true },
            currentLap: { type: Number, default: 0 },
            lapTimes: {
                type: [
                    {
                        minutes: { type: String, required: true },
                        seconds: { type: String, required: true },
                        milliseconds: { type: String, required: true },
                    },
                ],
                default: [], // Default to an empty array
            },
            lapTimesMS: { type: [Number], default: [] },
            fastestLap: {
                type:
                    {
                        minutes: { type: String, required: true },
                        seconds: { type: String, required: true },
                        milliseconds: { type: String, required: true },
                    },
                default: [], // Default to an empty array
            },
        }
    ],
    timeRemainingOngoingRace: { type: Number, default: 60000 },
    timeRemainingNextRace: { type: Number, default: 60000 },
});

module.exports = mongoose.model('Race', raceSchema);
