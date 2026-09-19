import { CoreCatalog, JetStreamCatalog } from "@/types/Subject"
import { FILTER_INVALID, canListen, normalizeListenFilter } from "./filter"

export function coreListenLabel(filter: string): string {
	return normalizeListenFilter(filter)
}

export function listenHintCopy(hint?: string | null): string | null {
	if (!hint) return null
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
		.filter((line): line is string => !!line)
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

export function coreStatus(enabled: boolean, core?: CoreCatalog | null, filter?: string): string | null {
	if (!enabled) return null
	if (core?.error == "not allowed") return "This account cannot listen for that name."
	if (core?.error == "busy") return "A listen is already running."
	if (core?.error == "timed out") return "The listen stopped before it finished."
	if (core?.error == FILTER_INVALID) return "That is not a valid name. Use dots, like orders.created or orders.>"
	if (core?.error) return `Core could not listen: ${core.error}.`
	if (!core) {
		const next = normalizeListenFilter(filter ?? "")
		if (!canListen(next)) return "That is not a valid name. Use dots, like orders.created or orders.>"
		return null
	}
	const bits: string[] = []
	if (core.truncated) bits.push("Core list was capped")
	if (core.dropped) bits.push(`${core.dropped} messages did not fit`)
	if (coreListenStale(core, filter)) {
		const next = normalizeListenFilter(filter ?? "")
		bits.push(next == ">" ? "Click LISTEN to hear every name" : `Click LISTEN to sample ${next}`)
	}
	if (bits.length == 0) return null
	return bits.join(". ") + "."
}

export function jetStreamStatus(enabled: boolean, js?: JetStreamCatalog | null): string | null {
	if (!enabled || !js) return null
	if (js.error == "not allowed") return "This account cannot read stored names."
	if (js.error == "timed out" && (js.streams?.length ?? 0) == 0) return "Stored names were not fully read."
	if (js.error && (js.streams?.length ?? 0) == 0) {
		if (js.error == "not enabled on this server") {
			return "JetStream is not on this server."
		}
		return `JetStream could not be read: ${js.error}.`
	}
	const bits: string[] = []
	if (js.failed) bits.push(`${js.failed} stream${js.failed == 1 ? "" : "s"} could not be read`)
	if (js.truncated || js.streams?.some(s => s.truncated)) bits.push("JetStream list was capped")
	if (js.error == "timed out") bits.push("stored names were not fully read")
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
	const { coreEnabled, jsEnabled, core, js, search, foundCount } = args
	if (!coreEnabled && !jsEnabled) return "Turn on Core or JetStream."
	if (foundCount > 0) return null
	if (search?.trim()) return "No names match."

	if (core?.error == "busy") return "A listen is already running."
	const notAllowed = core?.error == "not allowed" || js?.error == "not allowed"
	if (notAllowed) return "This account cannot see those names."

	const notFullyRead = !!(
		core?.error == "timed out" || js?.error == "timed out"
		|| core?.truncated || js?.truncated || (js?.failed ?? 0) > 0
	)
	if (notFullyRead) return "The list was not fully read."

	if (jsEnabled && js?.error == "not enabled on this server") {
		return "JetStream is not on this server."
	}

	if (coreEnabled && !core) return "Click LISTEN to hear live names."
	if (coreEnabled) return "Quiet right now."
	return "No stored names."
}

export function subjectCopyValue(node: { path: string, remainder?: boolean, hit?: { subject: string } }): string | null {
	if (node.remainder) return null
	return node.hit?.subject || node.path || null
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
