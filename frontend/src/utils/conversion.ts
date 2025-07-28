//#region BYTE

/**
 *  Converts a value in bytes to the specified unit.
 */
export function bytesToValue(value: number, to: BYTE) {
	switch (to) {
		case BYTE.TIB:
			return Math.round(value / 1099511627776)
		case BYTE.GIB:
			return Math.round(value / 1073741824)
		case BYTE.MIB:
			return Math.round(value / 1048576)
		case BYTE.KIB:
			return Math.round(value / 1024)
		default:
			return value
	}
}

/** Converts a value in the specified unit to bytes. */
export function valueToBytes(value: number, from: BYTE) {
	switch (from) {
		case BYTE.TIB:
			return value * 1099511627776
		case BYTE.GIB:
			return value * 1073741824
		case BYTE.MIB:
			return value * 1048576
		case BYTE.KIB:
			return value * 1024
		default:
			return value
	}
}

/** Converts a value in bytes to the specified unit, rounding to 2 decimal places. */
export function compactByte(bytes: number): { value: number; unit: BYTE } {
	if (bytes === undefined || bytes === null) return { value: null, unit: BYTE.BYTES }
	if (bytes === 0) return { value: 0, unit: BYTE.BYTES }

	const absBytes = Math.abs(bytes);

	if (absBytes >= 1099511627776) {
		return {
			value: Math.round((bytes / 1099511627776) * 100) / 100,
			unit: BYTE.TIB
		};
	} else if (absBytes >= 1073741824) {
		return {
			value: Math.round((bytes / 1073741824) * 100) / 100,
			unit: BYTE.GIB
		};
	} else if (absBytes >= 1048576) {
		return {
			value: Math.round((bytes / 1048576) * 100) / 100,
			unit: BYTE.MIB
		};
	} else if (absBytes >= 1024) {
		return {
			value: Math.round((bytes / 1024) * 100) / 100,
			unit: BYTE.KIB
		};
	} else {
		return { value: bytes, unit: BYTE.BYTES };
	}
}

export enum BYTE {
	BYTES = "b",
	KIB = "kib",
	MIB = "mib",
	GIB = "gib",
	TIB = "tib"
}

//#endregion


//#region LARGE NUMBERS

export function compactNumber(value: number): { value: number; unit: NUMBER_UNIT } {
	if (value === undefined || value === null) return { value: null, unit: NUMBER_UNIT.UNITS };
	if (value === 0) return { value: 0, unit: NUMBER_UNIT.UNITS };

	const absValue = Math.abs(value);
	const isNegative = value < 0;

	let optimizedValue: number;
	let unit: NUMBER_UNIT;

	if (absValue >= 1e15) {
		// Quadrillions
		optimizedValue = value / 1e15;
		unit = NUMBER_UNIT.QUADRILLION;
	} else if (absValue >= 1e12) {
		// Trillions
		optimizedValue = value / 1e12;
		unit = NUMBER_UNIT.TRILLION;
	} else if (absValue >= 1e9) {
		// Billions
		optimizedValue = value / 1e9;
		unit = NUMBER_UNIT.BILLION;
	} else if (absValue >= 1e6) {
		// Millions
		optimizedValue = value / 1e6;
		unit = NUMBER_UNIT.MILLION;
	} else if (absValue >= 1e3) {
		// Thousands
		optimizedValue = value / 1e3;
		unit = NUMBER_UNIT.THOUSAND;
	} else {
		// Units (no scaling needed)
		optimizedValue = value;
		unit = NUMBER_UNIT.UNITS;
	}

	// Ensure no more than 4 integer digits and round to 2 decimal places
	const absOptimized = Math.abs(optimizedValue);
	if (absOptimized >= 1000) {
		// If we still have 4+ digits, round to nearest integer
		optimizedValue = Math.round(optimizedValue);
	} else if (absOptimized >= 100) {
		// 3 digits: show 1 decimal place
		optimizedValue = Math.round(optimizedValue * 10) / 10;
	} else if (absOptimized >= 10) {
		// 2 digits: show 2 decimal places
		optimizedValue = Math.round(optimizedValue * 100) / 100;
	} else {
		// 1 digit: show 2 decimal places
		optimizedValue = Math.round(optimizedValue * 100) / 100;
	}

	return { value: optimizedValue, unit };
}

export enum NUMBER_UNIT {
	UNITS = "",
	THOUSAND = "K",
	MILLION = "M", 
	BILLION = "B",
	TRILLION = "T",
	QUADRILLION = "Q"
}

//#endregion


//#region TIME

/** Converts a value in nanoseconds to the specified time unit.*/
export function nsToValue(value: number, from: TIME) {
	return value / unitsInNs[from];
}
/** Converts a value in the specified time unit to nanoseconds.*/
export function valueToNs(value: number, from: TIME) {
	return value * unitsInNs[from];
}
/** Converts a value in nanoseconds to the specified time unit, rounding to 2 decimal places.*/
export function getLargestUnit(valueInNs: number, defaultUnit: TIME): TIME {
	let largestUnit = TIME.NS;
	if (valueInNs == 0) {
		return defaultUnit;
	}
	for (const [unit, ns] of Object.entries(unitsInNs)) {
		if (valueInNs % ns == 0) {
			largestUnit = unit as TIME;
		} else {
			break;
		}
	}

	return largestUnit;
}

export enum TIME {
	NS = "nano s.",
	MS = "milli s.",
	SECONDS = "seconds",
	MINUTES = "minutes",
	HOURS = "hours",
	DAYS = "days"
}

export const unitsInNs = {
	[TIME.NS]: 1,
	[TIME.MS]: 1e6,
	[TIME.SECONDS]: 1e9,
	[TIME.MINUTES]: 60 * 1e9,
	[TIME.HOURS]: 60 * 60 * 1e9,
	[TIME.DAYS]: 60 * 60 * 24 * 1e9
};


/**
 * Converts uptime string (e.g., "9d18h21m18s", "8h50m22s", "50m22s") to total seconds
 */
export function parseUptimeToSeconds(uptime: string): number {
	const timeUnits = {
		d: 86400, // 24 * 60 * 60
		h: 3600, // 60 * 60
		m: 60,
		s: 1
	};
	let totalSeconds = 0;
	// Single regex to match all time units at once
	const matches = uptime.matchAll(/(\d+)([dhms])/g);
	for (const match of matches) {
		const value = parseInt(match[1]);
		const unit = match[2] as keyof typeof timeUnits;
		totalSeconds += value * timeUnits[unit];
	}
	return totalSeconds;
}

//#endregion