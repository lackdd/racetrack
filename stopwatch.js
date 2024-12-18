const Race = require("./models/Race");

class Stopwatch {
    constructor() {
        this.stopwatches = {}; // Store lap times for drivers. Same as const [elapsedTimes, setElapsedTimes] = useState({})?
    }

/*    async saveStopwatchToDatabase() {
        try {
            const stopwatch = this.stopwatches[driverName];
            if (stopwatch) {
                await Race.findOneAndUpdate(
                    { driverName },
                    { timeRemainingOngoingRace: stopwatch.getCurrentLapTimes },
                    { new: true, upsert: true }
                );
                console.log(`Saved stopwatches for driver "${raceName}": ${stopwatch.getCurrentLapTimes} ms`);
            }
        } catch (error) {
            console.error(`Error saving stopwatches for race "${raceName}":`, error);
        }
    }*/

    initializeStopwatch(driverName, initialTime = 0) {
        if (!this.stopwatches[driverName]) {
            this.stopwatches[driverName] = {
                elapsedTime: initialTime,
                interval: null,
                running: false,
            };
        }
    }

    // Start stopwatch when driver starts new lap
    startStopwatch = (driverName) => {
        const stopwatch = this.stopwatches[driverName];
        if (!stopwatch) {
            console.error(`Stopwatch for driver ${driverName} not initialized.`);
            return;
        }
        if (!stopwatch.interval) {
            clearInterval(stopwatch.interval);

            stopwatch.interval = setInterval(() => {
                stopwatch.elapsedTime += 10;
            }, 10);
        }
    };

    // Stop and reset stopwatch when driver finishes lap
    // todo Always check whether interval is null before restarting the stopwatch to avoid creating duplicate intervals.
    resetStopwatch = (driverName) => {
        const stopwatch = this.stopwatches[driverName];
        if (!stopwatch) {
            console.error(`Stopwatch for driver ${driverName} not initialized.`);
            return;
        }
        clearInterval(stopwatch.interval);
        delete stopwatch.interval;
        stopwatch.elapsedTime = 0;
    };

    // Pause stopwatches for all drivers
    pauseAllStopwatches = (raceDrivers) => {
        //let stopwatch = this.stopwatches[raceDrivers];
        raceDrivers.forEach((driver) => {
            const stopwatch = this.stopwatches[driver.name];
            if (!stopwatch) {
                console.error(`Stopwatch for driver ${driver.name} not initialized.`);
                return;
            }
            clearInterval(stopwatch.interval);
            stopwatch.interval = null; // Mark interval as paused
        });
        console.log(raceDrivers) // log final results
    };

    // Stop stopwatches for all drivers and delete data when race finishes
    clearAllStopwatches = (raceDrivers) => {
        //let stopwatch = this.stopwatches[raceDrivers];
        raceDrivers.forEach((driver) => {
            const stopwatch = this.stopwatches[driver.name];
            if (stopwatch) {
                clearInterval(stopwatch.interval);
                delete this.stopwatches[driver.name];
            }
        });
        console.log(raceDrivers) // log final results
    };


    getCurrentLapTimes() {
        return Object.fromEntries(
            Object.entries(this.stopwatches).map(([driverName, stopwatchData]) => [
                driverName, stopwatchData.elapsedTime
            ])
        );
    }
}

module.exports = Stopwatch;
