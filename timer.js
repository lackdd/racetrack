// timer.js

class Timer {
    constructor() {
        this.timers = {}; // Store timers for races
        this.updateTimerFunction = null;
    }

    setUpdateTimerFunction(updateFunction) {
        this.updateTimerFunction = updateFunction;
    }

    initializeTimer(raceName, initialTime = 60000) {
        if (!this.timers[raceName]) {
            this.timers[raceName] = {
                timeRemaining: initialTime,
                interval: null,
                running: false,
            };
        }
    }

    startTimer(raceName, io, raceData) {
        const timer = this.timers[raceName];
        if (timer && !timer.running) {
            timer.running = true;
            timer.interval = setInterval(() => {
                timer.timeRemaining -= 10;
                if (timer.timeRemaining <= 0) {
                    this.pauseTimer(raceName); // was this.stopTimer(raceName)
                    timer.timeRemaining = 0; // Ensure it doesn't go negative
                    if (this.updateTimerFunction) {
                        this.updateTimerFunction({ raceName, timeRemaining: timer.timeRemaining });
                    }
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
        }
    }
    // 1
    resetTimer(raceName, io, initialTime = 60000) {
        this.pauseTimer(raceName);
        if (this.timers[raceName]) {
            this.timers[raceName].timeRemaining = initialTime;
            // Broadcast updated time to all clients
            io.emit('timerUpdate', { raceName, timeRemaining: initialTime });
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
