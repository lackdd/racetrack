const StopwatchesSchema = require("./models/Stopwatch");

class Stopwatch {
    constructor() {
        this.stopwatches = {}; // Store lap times for drivers. Same as const [elapsedTimes, setElapsedTimes] = useState({})?
    }

    async saveStopwatchesToDatabase() {
        try {
            const stopwatchesInDatabase = await StopwatchesSchema.findOne();
            //console.log("stopwatchesInDatabase: ", stopwatchesInDatabase);
            if (!stopwatchesInDatabase) {
                const newStopwatches = new StopwatchesSchema({
                    stopwatches: this.stopwatches,
                });
                await newStopwatches.save();
            } else {
                stopwatchesInDatabase.set("stopwatches", this.stopwatches);
                await stopwatchesInDatabase.save();
            }
        } catch (error) {
            console.error(`Error saving stopwatches:`, error);
        }
    }

    initializeStopwatch(driverName, initialTime = 0) {
        if (!this.stopwatches[driverName]) {
            this.stopwatches[driverName] = {
                elapsedTime: initialTime,
                interval: null,
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

            stopwatch.interval = setInterval(async() => {
                stopwatch.elapsedTime += 10;

                // Save to database every 1 second
                if (stopwatch.elapsedTime % 1000 === 0) {
                    await this.saveStopwatchesToDatabase();
                }
            }, 10);
        }
    };

    // Stop and reset stopwatch when driver finishes lap
    // todo Always check whether interval is null before restarting the stopwatch to avoid creating duplicate intervals.
    resetStopwatch = (driverName) => {
        const stopwatch = this.stopwatches[driverName];
        if (!stopwatch) {
            console.warn(`Stopwatch for driver ${driverName} not initialized.`);
            return;
        }
        clearInterval(stopwatch.interval);
        delete stopwatch.interval;
        stopwatch.elapsedTime = 0;
        this.saveStopwatchesToDatabase();
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
            if (stopwatch.interval === null) {
                console.warn(`Stopwatch for driver ${driver.name} is already stopped.`);
                return;
            }
            clearInterval(stopwatch.interval);
            stopwatch.interval = null; // Mark interval as paused
        });
        //console.log(raceDrivers) // log final results
    };

    // Continue stopwatches for all drivers
    continueAllStopwatches = (raceDrivers) => {
        raceDrivers.forEach((driver) => {
            const stopwatch = this.stopwatches[driver.name];
            if (!stopwatch) {
                console.error(`Stopwatch for driver ${driver.name} not initialized.`);
                return;
            }

            stopwatch.interval = setInterval(async() => {
                stopwatch.elapsedTime += 10;

                // Save to database every 1 second
                if (stopwatch.elapsedTime % 1000 === 0) {
                    await this.saveStopwatchesToDatabase();
                }
            }, 10);

        });
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
        this.saveStopwatchesToDatabase();
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
