import { canListen } from "./filter"

export type DiscoverReason = "open" | "toggle" | "refresh"

export function shouldFetchJetStream(enabled: boolean, hasCatalog: boolean, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (reason == "refresh") return true
	return !hasCatalog
}

export function shouldFetchCore(enabled: boolean, filter: string, hasCatalog: boolean, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (!canListen(filter)) return false
	// Reload/poll is the STREAMS list: cheap JetStream names.
	// A Core sample opens a dedicated connection and listens — LISTEN does that.
	if (reason == "refresh") return false
	return !hasCatalog
}
