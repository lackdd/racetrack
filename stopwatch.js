
class Stopwatch {
    constructor() {
        this.stopwatches = {}; // Store lap times for drivers. Same as const [elapsedTimes, setElapsedTimes] = useState({})?
    }

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
    resetStopwatch = (driverName) => {
        const stopwatch = this.stopwatches[driverName];
        if (!stopwatch) {
            console.error(`Stopwatch for driver ${driverName} not initialized.`);
            return;
        }
        clearInterval(stopwatch.interval);
        delete stopwatch.interval;
        stopwatch.elapsedTime = 0;
        // setElapsedTimes((prev) => ({
        //     ...prev,
        //     [driverName]: 0,
        // }));
    };

    // Stop stopwatches for all drivers and delete data when race finishes
    stopStopwatch = (raceDrivers) => {
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


    // getCurrentLapTimes() {
    //     console.log(this.stopwatches.elapsedTime);
    //     return this.stopwatches.elapsedTime || 0;
    // }

    getCurrentLapTimes() {
        return Object.fromEntries(
            Object.entries(this.stopwatches).map(([driverName, stopwatchData]) => [
                driverName, stopwatchData.elapsedTime
            ])
        );
    }
}

module.exports = Stopwatch;
