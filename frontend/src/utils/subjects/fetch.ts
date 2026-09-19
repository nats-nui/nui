export type DiscoverReason = "open" | "toggle" | "refresh"

export function shouldFetchJetStream(enabled: boolean, hasCatalog: boolean, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (reason == "refresh") return true
	return !hasCatalog
}

export function shouldFetchCore(_enabled: boolean, _filter: string, _hasCatalog: boolean, _reason: DiscoverReason): boolean {
	// Core is a subscribe. Opening the card, toggling, or polling must
	// not start one. LISTEN is the only way a sample starts.
	return false
}
