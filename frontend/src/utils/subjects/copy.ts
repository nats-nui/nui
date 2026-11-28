import { CoreCatalog, JetStreamCatalog, OccupiedCatalog } from "@/types/Subject"

export function statusLines(
	core?: CoreCatalog | null,
	js?: JetStreamCatalog | null,
	occupied?: Record<string, Pick<OccupiedCatalog, "error" | "truncated">>,
): string[] {
	const lines: string[] = []
	if (core) {
		if (core.error == "not allowed") lines.push(`This account cannot subscribe to ${core.filter}.`)
		else if (core.error == "timed out") lines.push("The live sample timed out.")
		else if (core.error == "interrupted") lines.push("The live sample ended early.")
		else if (core.error == "too much traffic") lines.push("Too much traffic to sample. Try a narrower subject pattern.")
		else if (core.error) lines.push("Could not finish the live sample. Check the connection and try again.")
		else if (core.truncated || core.dropped) lines.push("The live sample is incomplete. Try a narrower subject pattern.")
		else if (!core.subjects.length) lines.push(`No visible traffic matched ${core.filter} during this sample.`)
	}
	if (js?.error == "not enabled on this server") lines.push("JetStream is not enabled on this server.")
	else if (js?.error == "not allowed") lines.push("This account cannot list JetStream subjects.")
	else if (js?.error) lines.push(js.streams.length ? "Could not refresh all JetStream subjects." : "Could not load JetStream subjects.")
	else if (js?.truncated || js?.streams.some(stream => stream.truncated)) lines.push("Only part of the JetStream subject list is shown.")

	const lists = Object.values(occupied ?? {})
	if (lists.some(list => list.error)) lines.push("Could not list all stored subjects.")
	else if (lists.some(list => list.truncated)) lines.push("The stored subject list is incomplete.")
	return lines
}

export function leafTitle(path: string, heard?: number, streams?: { name: string, count?: number }[]): string {
	const bits = [path]
	if (heard) bits.push(`${heard} message${heard == 1 ? "" : "s"} in the live sample`)
	for (const stream of streams ?? []) {
		if (stream.count) bits.push(`${stream.count} stored in ${stream.name}`)
		else bits.push(`JetStream stream ${stream.name}`)
	}
	return bits.join(" · ")
}
