
// [CHAT.GPT]
type CaseObject = {
	[key: string]: any;
};
export function snakeToCamel(obj: CaseObject): CaseObject {
	if (Array.isArray(obj)) {
		return obj.map(snakeToCamel);
	} else if (obj !== null && typeof obj === 'object') {
		const newObj: CaseObject = {};
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

export function camelToSnake(obj: CaseObject): CaseObject {
	if (Array.isArray(obj)) {
		return obj.map(camelToSnake);
	} else if (obj !== null && typeof obj === 'object') {
		const newObj: CaseObject = {};
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