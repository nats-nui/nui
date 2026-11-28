export function isInternalSubject(subject: string): boolean {
	return /^(\$SYS|\$JS|_INBOX)(\.|$)/.test(subject)
}

export function canListen(filter: string): boolean {
	const value = filter?.trim()
	if (!value || /[\s\x00-\x1f\x7f-\x9f]/.test(value)) return false
	const tokens = value.split(".")
	return tokens.every((token, i) => token !== "" && (token !== ">" || i === tokens.length - 1))
}

export function sampleHint(filter: string, hideInternal: boolean): string | null {
	if (filter && !canListen(filter)) return "Invalid subject. Try orders.created or orders.>."
	if (hideInternal && isInternalSubject(filter)) return "In Filters, turn on Include internal subjects to sample this subject."
	return null
}

export function hasWildcard(subject: string): boolean {
	return subject.split(".").some(token => token == "*" || token == ">")
}

export function isLiteralSubject(subject: string): boolean {
	return canListen(subject) && !hasWildcard(subject)
}
