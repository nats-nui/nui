


/** Apertura del database */
export function dbLoad(): Promise<any[]> {
	return new Promise((res, rej) => {
		let openRequest = indexedDB.open("myDatabase", 2);
		openRequest.onupgradeneeded = function () {
			const db = openRequest.result
			if (!db.objectStoreNames.contains('myStore')) {
				db.createObjectStore('myStore', { keyPath: 'uuid' });
			}
		}
		openRequest.onerror = () =>	rej(openRequest.error)
		openRequest.onsuccess = function () {
			const result = []
			const db = openRequest.result
			const transaction = db.transaction(["myStore"], "readonly");
			const store = transaction.objectStore("myStore");
			const request = store.openCursor();
			request.onsuccess = function(event) {
				let cursor = request.result;
				if (cursor) {
					result.push(cursor.value)
					cursor.continue();
				} else {
					res(result)
				}
			};
		}		
	})
}

export function dbSave(states:any[]): Promise<void> {
	return new Promise((res,rej)=>{
		let openRequest = indexedDB.open("myDatabase", 2)
		openRequest.onupgradeneeded = function () {
			const db = openRequest.result
			if (!db.objectStoreNames.contains('myStore')) {
				db.createObjectStore('myStore', { keyPath: 'uuid' });
			}
		}
		openRequest.onerror = () =>	{
			rej(openRequest.error)
		}
		openRequest.onsuccess = function () {
			console.log("eeeee")
			let db = openRequest.result;
			let transaction = db.transaction(["myStore"], "readwrite");
			let store = transaction.objectStore("myStore");
			store.clear();
			for ( const state of states ) {
				let request = store.add(state);
				request.onerror = (e) => console.error("Error", request.error);
				request.onsuccess = (e) => console.log("JSON added to IndexedDB");
			}
			console.log("iiiiiiiiii")
			res()
		}	
	})
}


