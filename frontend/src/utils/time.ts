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
		if ( !callback ) {
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
	return new Promise(res => window.requestAnimationFrame(()=>res()))
}

export function dateShow( date?: any ): string {
	return dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD HH:mm:ss") : "--"
}