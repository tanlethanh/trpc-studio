export const formatFullTimestamp = (time: string | number | Date) => {
	return new Date(time).toLocaleTimeString([], {
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		fractionalSecondDigits: 3,
	});
};
