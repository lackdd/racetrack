const mongoose = require('mongoose');
const { Schema } = mongoose;

const stopwatchesSchema = new Schema({
    stopwatches: {
        // key: "stopwatches",
        type: Map,                                     // Map to hold key-value pairs
        of: new Schema({                               // Define structure of each Map value
            elapsedTime: { type: Number, default: 0 }, // Elapsed time in milliseconds
            running: { type: Boolean, default: false } // Is the stopwatch running
        }),
        default: {}                                    // Default to an empty object
    },
});

module.exports = mongoose.model('Stopwatch', stopwatchesSchema);

// stopwatches: {
//     d: {
//         elapsedTime: 2790,
//         running: false,
//         interval: Timeout {
//             idleTimeout: 10,
//             idlePrev: [Timeout],
//             idleNext: [TimersList],
//             idleStart: 1157946,
//             onTimeout: [Function (anonymous)],
//             timerArgs: undefined,
//             repeat: 10,
//             destroyed: false,
//             [Symbol(refed)]: true,
//             [Symbol(kHasPrimitive)]: false,
//             [Symbol(asyncId)]: 4577,
//             [Symbol(triggerId)]: 4573
//         }
//     },
//     e: { elapsedTime: 0, running: false }
// }

