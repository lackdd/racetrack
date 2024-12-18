const mongoose = require('mongoose');
const { Schema } = mongoose;

const lastRaceSchema = new Schema({
    raceName: { type: String, required: true },
    isOngoing: { type: Boolean, default: false },
    drivers: [
        {
            name: { type: String, required: true },
            car: { type: Number, required: true },
            finishedLaps: { type: Number, default: 0 },
            lapTimes: { type: [String], default: [] },
            lapTimesMS: { type: [Number], default: [] },
            fastestLap: { type: String, default: null }
        }
    ],
    timeRemainingOngoingRace: { type: Number, default: 0 },
    timeRemainingNextRace: { type: Number, default: 0 },
});

module.exports = mongoose.model('LastRaceData', lastRaceSchema);
