
/** restituisce un uuid */
export function createUUID(): string {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		(c) => {
			let r = (dt + (Math.random() * 16)) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		}
	)
	return uuid;
}

/** restituisce il timestamp string della data di oggi */
export function getNow(): string {
	return new Date().toISOString()
}

/** restituisce un numero random compreso tra "min" e "max" */
export function randomInt(max?:number, min?:number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}