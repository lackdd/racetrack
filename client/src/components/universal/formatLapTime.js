// function to format lap times for milliseconds to readable mm:ss:SS format

// export const formatLapTime = (milliseconds) => {
//     const minutes = Math.floor(milliseconds / 60000);
//     const seconds = Math.floor((milliseconds % 60000) / 1000);
//     const millisecondsRemainder = milliseconds % 1000;
//
//     return `${minutes.toString().padStart(2, '0')}:${seconds
//         .toString()
//         .padStart(2, '0')}:${millisecondsRemainder.toString().padStart(3, '0')}`;
// }

export function formatLapTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = (milliseconds % 1000) / 10;

    return {
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        milliseconds: millisecondsRemainder.toString().padStart(2, '0')
    };
}