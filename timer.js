// timer.js
const Race = require('./models/Race');

class Timer {
    constructor() {
        this.timers = {}; // Store timers for races
        this.updateTimerFunction = null;
    }

    setUpdateTimerFunction(updateFunction) {
        this.updateTimerFunction = updateFunction;
    }

    initializeTimer(raceName, initialTime) {
        if (!this.timers[raceName]) {
            this.timers[raceName] = {
                timeRemaining: initialTime,
                interval: null,
                running: false,
            };
        }
    }

    async saveTimerToDatabase(raceName) {
        try {
            const timer = this.timers[raceName];
            if (timer) {
                await Race.findOneAndUpdate(
                    { raceName },
                    { timeRemainingOngoingRace: timer.timeRemaining },
                    { new: true, upsert: true }
                );
                console.log(`Saved timer for race "${raceName}": ${timer.timeRemaining} ms`);
            }
        } catch (error) {
            console.error(`Error saving timer for race "${raceName}":`, error);
        }
    }

    startTimer(raceName, io, raceData) {
        const timer = this.timers[raceName];
        if (timer && !timer.running) {
            timer.running = true;
            timer.interval = setInterval(async () => {
                timer.timeRemaining -= 10;
                if (timer.timeRemaining <= 0) {
                    this.pauseTimer(raceName); // was this.stopTimer(raceName)
                    timer.timeRemaining = 0; // Ensure it doesn't go negative
                    if (this.updateTimerFunction) {
                        this.updateTimerFunction({ raceName, timeRemaining: timer.timeRemaining });
                    }
                }

                // Save to database every 1 second
                if (timer.timeRemaining % 1000 === 0) {
                    await this.saveTimerToDatabase(raceName);
                }

                // Update the raceData dynamically
                const race = raceData.find(r => r.raceName === raceName);
                if (race) {
                    if (raceName === "nextRace") {
                        race.timeRemainingNextRace = timer.timeRemaining;
                    } else {
                        race.timeRemainingOngoingRace = timer.timeRemaining;
                    }
                    //io.emit("raceData", raceData); // Broadcast updated race data to all clients
                }

                // Broadcast updated time to all clients
                io.emit('timerUpdate', { raceName, timeRemaining: timer.timeRemaining });
            }, 10);
        }
    }

    pauseTimer(raceName) {
        const timer = this.timers[raceName];
        if (timer && timer.running) {
            clearInterval(timer.interval);
            timer.running = false;
            this.saveTimerToDatabase(raceName);
        }
    }
    // 1
    resetTimer(raceName, io, initialTime) {
        this.pauseTimer(raceName);
        if (this.timers[raceName]) {
            this.timers[raceName].timeRemaining = initialTime;
            // Broadcast updated time to all clients
            io.emit('timerUpdate', { raceName, timeRemaining: initialTime });
            //this.saveTimerToDatabase(raceName);    ei tea kas vaja enam
        }
    }

    deleteTimer(raceName) {
        const timer = this.timers[raceName];
        if (timer) {
            if (timer.running) {
                clearInterval(timer.interval);
            }
            delete this.timers[raceName];
            console.log(`Deleted timer for race "${raceName}".`);
        }
    }

    getTimeRemaining(raceName) {
             return this.timers[raceName]?.timeRemaining || 0;
         }

    isRunning(raceName) {
        return this.timers[raceName]?.running || false;
    }
}

module.exports = Timer;
