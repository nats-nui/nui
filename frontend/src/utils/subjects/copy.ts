import { CoreCatalog, JetStreamCatalog } from "@/types/Subject"
import { FILTER_INVALID, canListen, normalizeListenFilter } from "./filter"

export function listenHintCopy(hint?: string | null): string | null {
	if (!hint) return null
	if (hint == FILTER_INVALID) return "Invalid subject. Use a subject or wildcard pattern, such as orders.created or orders.>"
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
		.filter((line): line is string => !!line)
	const occupiedLine = jsEnabled ? occupiedStatus(occupied) : null
	if (occupiedLine) lines.push(occupiedLine)
	return lines
}

export function occupiedStatus(occupied?: Record<string, { truncated?: boolean, error?: string, subjects?: unknown[] }>): string | null {
	const rows = Object.values(occupied ?? {})
	const failed = rows.some(r => r.error)
	const truncated = rows.some(r => r.truncated)
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

export function coreStatus(enabled: boolean, core?: CoreCatalog | null, filter?: string): string | null {
	if (!enabled) return null
	if (core?.error == "not allowed") return "This account cannot subscribe to that subject."
	if (core?.error == "timed out") return "The subscription timed out."
	if (core?.error == FILTER_INVALID) return listenHintCopy(FILTER_INVALID)
	if (core?.error) return `Core subscription failed: ${core.error}.`
	if (!core) {
		const next = normalizeListenFilter(filter ?? "")
		if (next && !canListen(next)) return listenHintCopy(FILTER_INVALID)
		return null
	}
	const bits: string[] = []
	if (core.truncated) bits.push("Core list was capped")
	if (core.dropped) bits.push(`${core.dropped} messages did not fit`)
	if (coreListenStale(core, filter)) {
		const next = normalizeListenFilter(filter ?? "")
		if (next == ">") bits.push("Click LISTEN to subscribe to all subjects")
		else if (next) bits.push(`Click LISTEN to subscribe to ${next}`)
	}
	if (bits.length == 0) return null
	return bits.join(". ") + "."
}

export function jetStreamStatus(enabled: boolean, js?: JetStreamCatalog | null): string | null {
	if (!enabled || !js) return null
	if (js.error == "not allowed") return "This account cannot read stream subjects."
	if (js.error == "timed out" && (js.streams?.length ?? 0) == 0) return "Stream subjects were not fully read."
	if (js.error && (js.streams?.length ?? 0) == 0) {
		if (js.error == "not enabled on this server") {
			return "JetStream is not enabled on this server."
		}
		return `JetStream could not be read: ${js.error}.`
	}
	const bits: string[] = []
	if (js.truncated || js.streams?.some(s => s.truncated)) bits.push("JetStream list was capped")
	if (js.error == "timed out") bits.push("stream subjects were not fully read")
	else if (js.error) bits.push("stream subjects could not be refreshed")
	if (bits.length == 0) return null
	const line = bits.join("; ")
	return line.charAt(0).toUpperCase() + line.slice(1) + "."
}

export function emptyCopy(args: {
	coreEnabled: boolean
	jsEnabled: boolean
	core?: CoreCatalog | null
	js?: JetStreamCatalog | null
	search: string
	foundCount: number
}): string | null {
	const { coreEnabled, jsEnabled, search, foundCount } = args
	const core = coreEnabled ? args.core : null
	const js = jsEnabled ? args.js : null
	if (!coreEnabled && !jsEnabled) return "Turn on Core or JetStream."
	if (foundCount > 0) return null
	if (search?.trim()) return "No subjects match."

	const notAllowed = core?.error == "not allowed" || js?.error == "not allowed"
	if (notAllowed) return "This account cannot access those subjects."

	const notFullyRead = !!(
		core?.error == "timed out" || js?.error == "timed out"
		|| core?.truncated || js?.truncated
	)
	if (notFullyRead) return "The list was not fully read."

	if (jsEnabled && js?.error == "not enabled on this server") {
		return "JetStream is not enabled on this server."
	}
	if (core?.error || js?.error) return "The list could not be read."

	if (coreEnabled && !core) return "Enter a subject and click LISTEN, or select ALL."
	if (coreEnabled) return "No subjects observed."
	return "No stream subjects."
}

export function leafTitle(path: string, heard?: number, streams?: { name: string, count?: number }[]): string {
	const bits = [path]
	if (heard) bits.push(`${heard} message${heard == 1 ? "" : "s"} observed via Core`)
	for (const s of streams ?? []) {
		if (s.count) bits.push(`${s.count} message${s.count == 1 ? "" : "s"} stored in ${s.name}`)
		else bits.push(`stream: ${s.name}`)
	}
	return bits.join(" · ")
}
