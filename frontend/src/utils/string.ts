/**
 * Converts a "binary-string" to a "string"
 */
export function binaryStringToString(binaryString: string) {
	//const binaryString = atob(str);
	// create a Uint8Array from binary string
	const bytes = new Uint8Array(binaryString.length)
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i)
	}
	// decodes UTF-8 byte array into string
	return new TextDecoder().decode(bytes)
}

/**
 * Converts a "string" to a "binary-string"
 */
export function stringToBinaryString(str: string): string {
	// encode the string in UTF-8
	const utf8Bytes = new TextEncoder().encode(str);
	// convert byte array to binary string
	let binaryString = '';
	const CHUNK_SIZE = 0x8000; // 32KB chunks (safe size for most environments)
	for (let i = 0; i < utf8Bytes.length; i += CHUNK_SIZE) {
		const chunk = utf8Bytes.subarray(i, i + CHUNK_SIZE);
		binaryString += String.fromCharCode(...chunk);
	}
	return binaryString;
}

/**
  * Esporta un numero intero in formato con divisione in migliaia
  */
export function formatNumber(value: number | string, separator: string = "'") {
	if (value == null) return '--';
	const num = typeof value === 'string' ? Number(value) : value;
	if (isNaN(num)) return '--';
	const intStr = num.toFixed(0)
	return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}