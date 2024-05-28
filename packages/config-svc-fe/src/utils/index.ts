export const convertMillisecondsToDHMS = (milliseconds: number) => {
	// Calculate days, hours, minutes, and seconds
	const seconds = milliseconds / 1000;
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	// Calculate remaining hours, minutes, and seconds after subtracting days
	const remainingHours = hours % 24;
	const remainingMinutes = minutes % 60;
	const remainingSeconds = seconds % 60;

	return {
		days,
		hours: remainingHours,
		minutes: remainingMinutes,
		seconds: remainingSeconds
	};
};

export function changeToEpoch(days: number, hours: number, minutes: number, seconds: number) {
    // Calculate the total number of seconds
    var totalSeconds = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
    
    // Return the epoch time in seconds
    return totalSeconds;
}