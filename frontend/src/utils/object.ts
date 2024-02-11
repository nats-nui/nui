

// [CHAT.GPT]
export function snakeToCamel(obj: any): any {
	if (Array.isArray(obj)) {
		return obj.map(snakeToCamel);
	} else if (obj !== null && typeof obj === 'object') {
		const newObj: any = {};
		for (let key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
				newObj[camelKey] = snakeToCamel(obj[key]);
			}
		}
		return newObj;
	} else {
		return obj;
	}
}
// [CHAT.GPT]
export function camelToSnake(obj: any): any {
	if (Array.isArray(obj)) {
		return obj.map(camelToSnake);
	} else if (obj !== null && typeof obj === 'object') {
		const newObj: any = {};
		for (let key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const snakeKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
				newObj[snakeKey] = camelToSnake(obj[key]);
			}
		}
		return newObj;
	} else {
		return obj;
	}
}

// Confronto due oggetti solo al primo livello
export function compare(objFind: any, obj: any): boolean {
	for (let key of Object.keys(objFind)) {
		if (objFind[key] !== obj[key]) {
			return false
		}
	}
	return true;
}

export function deepEqual(obj1: any, obj2: any): boolean {
	const typeObj1 = typeof obj1
	const typeObj2 = typeof obj2
	if (typeObj1 == "object" && typeObj1 == typeObj2) {
		for (let key in obj1) {
			if (!deepEqual(obj1[key], obj2[key])) return false
		}
		return true
	}
	return obj1 == obj2
}
