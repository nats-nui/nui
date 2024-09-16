
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
	const binaryString = String.fromCharCode(...utf8Bytes);
	return binaryString
	// return btoa(binaryString);
}