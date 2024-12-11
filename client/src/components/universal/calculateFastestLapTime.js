// function to calculate the fastest lap time for each driver
export const fastestLapTime = (laptimes) => {
    if (laptimes.length < 1) {
        return null;
    }
    return Math.min(...laptimes);
}