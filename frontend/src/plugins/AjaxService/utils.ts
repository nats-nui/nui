


export function encodeUrl(url: string): string {
	const regex = /\?[^&?/]+=[^?]*&*$/g;
	let match: RegExpExecArray | null;
	let lastMatchIndex = -1;
	let queryString = "";

	// find the last match to avoid errors in case of ? special chars
	// in stream names
	while ((match = regex.exec(url)) !== null) {
		lastMatchIndex = match.index;
	}

	if (lastMatchIndex !== -1) {
		queryString = url.substring(lastMatchIndex)
		url = url.substring(0, lastMatchIndex)
	}

	return url.split('/')
		.map((segment, index) => {
			// Don't encode the empty segments that appear when the path starts or ends with /
			// or when there are consecutive slashes
			return segment === '' ? segment : encodeURIComponent(segment);
		})
		.join('/').concat(queryString);
}
