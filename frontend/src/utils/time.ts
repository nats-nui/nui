import dayjs from "dayjs";



let timeoutIDs = {};
/**
 * attende un determinato tempo prima di eseguire una funzione
 * se la funzione è richiamata resetta il tempo e riaspetta
 * usata per resettare un valore che rimane in loading per troppo tempo
 */
export function debounce(name: string, callback?: () => void, delay?: number): void {
	if (delay == 0) {
		callback?.apply(this, null);
	} else {
		let toId = timeoutIDs[name];
		if (toId != null) clearTimeout(toId)
		if (!callback) {
			delete timeoutIDs[name]
			return
		}
		timeoutIDs[name] = setTimeout(() => {
			delete timeoutIDs[name];
			callback.apply(this, null);
		}, delay);
	}
}
export function debounceExist(name: string): boolean {
	return !!timeoutIDs[name]
}
/**
 * crea una pausa async
 */
export function delay(millisec: number): Promise<void> {
	return new Promise(res => setTimeout(res, millisec))
}

export function delayAnim(): Promise<void> {
	return new Promise(res => window.requestAnimationFrame(() => res()))
}

export function dateShow(date?: any): string {
	return dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD HH:mm:ss") : "--"
}

let throttleIDs = {};
/**
 * esegue la funzione con un frame rate differente
 */
export function throttle(name: string, callback?: () => void, delay?: number): void {
	if (delay == 0) {
		callback?.apply(this, null);
	} else {
		let toId = throttleIDs[name];
		// se è già in esecuzione non faccio nulla
		if (!!toId) return;
		callback.apply(this, null);
		throttleIDs[name] = setTimeout(() => {
			delete throttleIDs[name];
		}, delay);
	}
}


let throttle2IDs = {};
/**
 * esegue la funzione con un frame rate differente
 */
export async function throttle2(name: string, callback: () => Promise<void>, delay?: number) {

	if (delay == 0) {
		throttleIDs[name] = 999
		await callback()
		delete throttle2IDs[name];
	} else {

		// se è già in esecuzione non faccio nulla
		let toId = throttle2IDs[name];
		if (!!toId) return;
		throttleIDs[name] = 999

		await callback()

		throttleIDs[name] = setTimeout(() => {
			delete throttle2IDs[name];
		}, delay);
	}
}