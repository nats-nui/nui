const DB_VERSION = 4
const DB_NAME = "myDatabase"
const DB_STORES = "myStore"



/** Apertura del database */
export function dbLoad(): Promise<any[]> {
	return new Promise((res, rej) => {
		/** apre il DB con una specifica versione */
		let openRequest = indexedDB.open(DB_NAME, DB_VERSION);
		/** in caso sia vuoto oppure da aggiornare (vedi "version") */
		openRequest.onupgradeneeded = handleUpdateDb
		openRequest.onerror = () => rej(openRequest.error)
		openRequest.onsuccess = () => {
			const db = openRequest.result
			const transaction = db.transaction([DB_STORES], "readonly");
			const store = transaction.objectStore(DB_STORES);
			const request = store.openCursor();
			const result = []
			request.onsuccess = (event) => {
				let cursor = request.result;
				if (cursor) {
					result.push(cursor.value)
					cursor.continue();
				} else {
					res(result)
				}
			}
		}
	})
}

export function dbSave(states: any[]): Promise<void> {
	return new Promise((res, rej) => {
		let openRequest = indexedDB.open(DB_NAME, DB_VERSION)
		openRequest.onupgradeneeded = handleUpdateDb
		openRequest.onerror = () => rej(openRequest.error)
		openRequest.onsuccess = () => {
			let db = openRequest.result;
			let transaction = db.transaction([DB_STORES], "readwrite");
			let store = transaction.objectStore(DB_STORES);
			store.clear();
			for (const state of states) {
				let request = store.add(state);
				request.onerror = (e) => console.error("Error", request.error);
				request.onsuccess = (e) => console.log("JSON added to IndexedDB");
			}
			res()
		}
	})
}


function handleUpdateDb(this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) {
	const db = this.result
	if (db.objectStoreNames.contains('myStore')) {
		db.deleteObjectStore("myStore")
	}
	db.createObjectStore('myStore', { autoIncrement: true });
}
