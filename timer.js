// timer.js

class Timer {
    constructor() {
        this.timers = {}; // Store timers for races
    }

    initializeTimer(raceName, initialTime = 600000) {
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
                timer.timeRemaining -= 100;
                if (timer.timeRemaining <= 0) {
                    this.stopTimer(raceName);
                    timer.timeRemaining = 0; // Ensure it doesn't go negative
                }

                // Update the raceData dynamically
                const race = raceData.find(r => r.raceName === raceName);
                if (race) {
                    if (raceName === "nextRace") {
                        race.timeRemainingNextRace = timer.timeRemaining;
                    } else {
                        race.timeRemainingOngoingRace = timer.timeRemaining;
                    }
                    io.emit("raceData", raceData); // Broadcast updated race data to all clients
                }
                // Broadcast updated time to all clients
                io.emit('timerUpdate', { raceName, timeRemaining: timer.timeRemaining });
            }, 100);
        }
    }

    pauseTimer(raceName) {
        const timer = this.timers[raceName];
        if (timer && timer.running) {
            clearInterval(timer.interval);
            timer.running = false;
        }
    }

    resetTimer(raceName, io, initialTime = 600000) {
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
