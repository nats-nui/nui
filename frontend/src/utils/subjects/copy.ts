import { CoreCatalog, JetStreamCatalog } from "@/types/Subject"
import { FILTER_INVALID, FILTER_REQUIRED, FILTER_TOO_BROAD, canListen, normalizeListenFilter } from "./filter"

export const LEGEND = [
	"A subject is a name a message travels on. Core is live and forgets. JetStream keeps messages.",
]

export function coreListenLabel(filter: string): string {
	return normalizeListenFilter(filter)
}

export function listenHintCopy(hint?: string | null): string | null {
	if (!hint) return null
	if (hint == FILTER_REQUIRED) return "Click LISTEN to hear what is moving now."
	if (hint == FILTER_TOO_BROAD) return "Listening to every name is how discovery works. The list is capped if it is busy."
	if (hint == FILTER_INVALID) return "That is not a valid name. Use dots, like orders.created or orders.>"
	return hint
}

export function statusLines(
	coreEnabled: boolean,
	jsEnabled: boolean,
	core?: CoreCatalog | null,
	js?: JetStreamCatalog | null,
	occupied?: Record<string, { truncated?: boolean, error?: string, subjects?: unknown[] }>,
	filter?: string,
): string[] {
	const lines = [jetStreamStatus(jsEnabled, js), coreStatus(coreEnabled, core, filter)]
	const occupiedLine = occupiedStatus(occupied)
	if (occupiedLine) lines.push(occupiedLine)
	return lines
}

export function occupiedStatus(occupied?: Record<string, { truncated?: boolean, error?: string, subjects?: unknown[] }>): string | null {
	const rows = Object.values(occupied ?? {})
	if (rows.length == 0) return null
	const failed = rows.filter(r => r.error).length
	const truncated = rows.filter(r => r.truncated).length
	const bits: string[] = []
	if (truncated) bits.push("a stored list was capped")
	if (failed) bits.push("a stored list could not be read")
	if (bits.length == 0) return null
	const line = bits.join("; ")
	return line.charAt(0).toUpperCase() + line.slice(1) + "."
}

export function coreListenStale(core?: CoreCatalog | null, filter?: string): boolean {
	if (!core?.filter) return false
	if (filter == null) return false
	return normalizeListenFilter(filter) != core.filter
}

export function coreStatus(enabled: boolean, core?: CoreCatalog | null, filter?: string): string {
	if (!enabled) return "Core is off."
	if (core?.error == "not allowed") return "This account cannot listen for that name."
	if (core?.error == "timed out") return "The listen stopped before it finished."
	if (core?.error == FILTER_REQUIRED || core?.error == FILTER_TOO_BROAD) {
		return "Click LISTEN to hear what is moving now. Busy lists are capped."
	}
	if (core?.error == FILTER_INVALID) return "That is not a valid name. Use dots, like orders.created or orders.>"
	if (core?.error) return `Core could not listen: ${core.error}.`
	if (!core) {
		const next = normalizeListenFilter(filter ?? "")
		if (!canListen(next)) return "That is not a valid name. Use dots, like orders.created or orders.>"
		if (next == ">") return "Click LISTEN to hear what is moving now."
		return `Click LISTEN to sample ${next}.`
	}
	const names = core.heard ?? core.subjects?.length ?? 0
	const window = `${(core.listenMs / 1000).toFixed(1)}s`
	const where = core.filter == ">" ? "every name" : core.filter
	let line = `Core heard ${names} name${names == 1 ? "" : "s"} in ${window}`
	if (where) line += ` on ${where}`
	line += "."
	if (core.truncated) line += " List was capped."
	if (core.dropped) line += ` ${core.dropped} messages did not fit.`
	if (coreListenStale(core, filter)) {
		const next = normalizeListenFilter(filter ?? "")
		line += next == ">" ? " Click LISTEN to hear every name." : ` Click LISTEN to sample ${next}.`
	}
	return line
}

export function jetStreamStatus(enabled: boolean, js?: JetStreamCatalog | null): string {
	if (!enabled) return "JetStream is off."
	if (!js) return "Reading stored names…"
	if (js.error == "not allowed") return "This account cannot read stored names."
	if (js.error == "timed out" && (js.streams?.length ?? 0) == 0) return "Stored names were not fully read."
	if (js.error && (js.streams?.length ?? 0) == 0) {
		if (js.error == "not enabled on this server") {
			return "JetStream is not on this server. That store is optional. Core still works."
		}
		return `JetStream could not be read: ${js.error}.`
	}
	const names = js.streams?.reduce((sum, s) => sum + (s.subjects?.length ?? 0), 0) ?? 0
	const streams = js.streams?.length ?? 0
	let line = `JetStream has ${names} name${names == 1 ? "" : "s"} to keep in ${streams} stream${streams == 1 ? "" : "s"}.`
	if (js.failed) line += ` ${js.failed} stream${js.failed == 1 ? "" : "s"} could not be read.`
	if (js.truncated || js.streams?.some(s => s.truncated)) line += " List was capped."
	if (js.error == "timed out") line += " Stored names were not fully read."
	return line
}

export function emptyCopy(args: {
	coreEnabled: boolean
	jsEnabled: boolean
	core?: CoreCatalog | null
	js?: JetStreamCatalog | null
	search: string
	foundCount: number
}): string | null {
	const { coreEnabled, jsEnabled, core, js, search, foundCount } = args
	if (!coreEnabled && !jsEnabled) return "Turn on Core or JetStream to look."
	if (foundCount > 0) return null
	if (search?.trim()) return "No names match that search."

	const notAllowed = core?.error == "not allowed" || js?.error == "not allowed"
	if (notAllowed) return "This account cannot see those names."

	const notFullyRead = !!(
		core?.error == "timed out" || js?.error == "timed out"
		|| core?.truncated || js?.truncated || (js?.failed ?? 0) > 0
	)
	if (notFullyRead) return "The list was not fully read. Click LISTEN or reload to try again."

	if (jsEnabled && js?.error == "not enabled on this server") {
		if (coreEnabled && !core) return "JetStream is not on this server. Click LISTEN to hear live names. Core only sees messages while we look."
		return "JetStream is not on this server. Core heard nothing in this listen — it only sees messages while we look."
	}

	if (coreEnabled && !core) {
		if (jsEnabled) return "No stored names yet. Click LISTEN to hear what is moving now. Core forgets anything that happened before we listened."
		return "Click LISTEN to hear what is moving now. Core does not remember the past."
	}

	if (coreEnabled && jsEnabled) {
		return "Quiet right now. Click LISTEN to hear what is moving, or open a name with a ▸ to see what a stream kept."
	}
	if (coreEnabled) {
		return "Core heard nothing in this listen. Click LISTEN to try again."
	}
	return "No stored names. Open a name with a ▸ to see what a stream kept."
}

export function firstListenCopy(filter: string, listenMs: number): string {
	const f = normalizeListenFilter(filter)
	const where = f == ">" ? "every name" : f
	return `Listening for ${(listenMs / 1000).toFixed(1)}s on ${where}. Core only sees messages that happen during this listen.`
}

export function leafTitle(path: string, heard?: number, streams?: { name: string, count?: number }[]): string {
	const bits = [path]
	if (heard) bits.push(`heard ${heard} time${heard == 1 ? "" : "s"} just now`)
	for (const s of streams ?? []) {
		if (s.count) bits.push(`${s.count} stored in ${s.name}`)
		else bits.push(`kept by ${s.name}`)
	}
	return bits.join(" · ")
}
