import dayjs from "dayjs"

/**
 * Calculates and formats the elapsed time since a given timestamp
 * @param timestamp - The timestamp to calculate elapsed time from
 * @returns A formatted string representing the elapsed time (e.g., "just now", "5s", "2h30m", "1d5h")
 */
export function getDeltaTime(timestamp: string | Date): [string, boolean] {
	const lastDjs = dayjs(timestamp)
	const now = dayjs()
	const diffSeconds = now.diff(lastDjs, 'second')
	const isRecent = now.diff(lastDjs, 'minute') < 1
	
	if (diffSeconds < 3) {
		return ["just now", isRecent]
	} else if (diffSeconds < 60) {
		return [`${diffSeconds}s`, isRecent]
	} else {
		const days = Math.floor(diffSeconds / (24 * 60 * 60))
		const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60))
		const minutes = Math.floor((diffSeconds % (60 * 60)) / 60)
		const seconds = diffSeconds % 60

		const parts = []
		if (days > 0) parts.push(`${days}d`)
		if (hours > 0) parts.push(`${hours}h`)
		if (minutes > 0) parts.push(`${minutes}m`)
		if (seconds > 0 && parts.length < 2) parts.push(`${seconds}s`) // Only show seconds if less than 2 other units

		return [parts.join(''), isRecent]
	}
}
