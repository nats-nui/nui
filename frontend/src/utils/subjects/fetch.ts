import { canListen, isCatchAll } from "./filter"

export type DiscoverReason = "open" | "toggle" | "refresh" | "poll"

export function shouldFetchJetStream(enabled: boolean, hasCatalog: boolean, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (reason == "refresh" || reason == "poll") return true
	return !hasCatalog
}

// Refresh is a time-boxed Core sample. Opening the card never starts one.
export function shouldFetchCore(enabled: boolean, filter: string, _hasCatalog: boolean, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (!canListen(filter)) return false
	return reason == "refresh"
}

// Continuous update is one live subscribe. Poll does not DialOnce again.
// A catch-all is not started by poll alone — that takes LISTEN or ALL.
export function shouldWatchCore(enabled: boolean, filter: string, watching: boolean, polling: boolean): boolean {
	if (!enabled) return false
	if (!canListen(filter)) return false
	if (watching) return true
	return polling && !isCatchAll(filter)
}
