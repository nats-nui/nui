import { canListen } from "./filter"

export type DiscoverReason = "open" | "toggle" | "refresh" | "poll"

export function shouldFetchJetStream(enabled: boolean, hasCatalog: boolean, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (reason == "refresh" || reason == "poll") return true
	return !hasCatalog
}

export function shouldFetchCore(enabled: boolean, filter: string, reason: DiscoverReason): boolean {
	if (!enabled) return false
	if (!(filter ?? "").trim()) return false
	if (!canListen(filter)) return false
	return reason == "refresh"
}

export function shouldWatchCore(enabled: boolean, filter: string, watching: boolean): boolean {
	if (!enabled) return false
	if (!canListen(filter)) return false
	return watching
}
