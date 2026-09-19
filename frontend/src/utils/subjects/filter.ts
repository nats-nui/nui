export const FILTER_INVALID = "that is not a valid name"

export function normalizeListenFilter(filter: string): string {
	const value = filter?.trim() ?? ""
	return value || ">"
}

export function validateListenFilter(filter: string): string | null {
	const value = normalizeListenFilter(filter)
	if (/\s/.test(value)) return FILTER_INVALID
	const tokens = value.split(".")
	for (let i = 0; i < tokens.length; i++) {
		const tok = tokens[i]
		if (!tok) return FILTER_INVALID
		if (tok == ">") {
			if (i != tokens.length - 1) return FILTER_INVALID
			continue
		}
		if (tok == "*") continue
		if (tok.includes("*") || tok.includes(">")) return FILTER_INVALID
	}
	return null
}

export function canListen(filter: string): boolean {
	return validateListenFilter(filter) == null
}

export function isCatchAll(filter: string): boolean {
	return (filter ?? "").trim() == ">"
}
