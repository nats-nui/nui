
/**
 * Converte una "binary-string" in una "string"
 */
export function binaryStringToString(binaryString: string) {

	// Primo passo: decodifica la stringa Base64 in una stringa binaria
	//const binaryString = atob(str);

	// Secondo passo: crea un Uint8Array dalla stringa binaria
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	// Terzo passo: decodifica l'array di byte UTF-8 in una stringa
	return new TextDecoder().decode(bytes);
}

/**
 * Converte una "string" in una "binary-string"
 */
export function stringToBinaryString(str: string): string {
	// Primo passo: codifica la stringa in UTF-8
	const utf8Bytes = new TextEncoder().encode(str);

	// Secondo passo: converti l'array di byte in una stringa binaria
	const binaryString = String.fromCharCode(...utf8Bytes);

	return binaryString
	// // Terzo passo: codifica la stringa binaria in Base64
	// return btoa(binaryString);
}