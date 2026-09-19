import { canListen } from "./filter"

export type DiscoverReason = "open" | "toggle" | "refresh" | "poll"

export function shouldFetchJetStream(enabled: boolean, hasCatalog: boolean, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (reason == "refresh" || reason == "poll") return true
	return !hasCatalog
}

// Refresh is a time-boxed Core sample of a name the user typed.
// Opening the card never starts one. An empty box is not `>`.
export function shouldFetchCore(enabled: boolean, filter: string, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (!(filter ?? "").trim()) return false
	if (!canListen(filter)) return false
	return reason == "refresh"
}

// Poll reads a live snapshot only if LISTEN already started it.
export function shouldWatchCore(enabled: boolean, filter: string, watching: boolean): boolean {
	if (!enabled) return false
	if (!canListen(filter)) return false
	return watching
}
