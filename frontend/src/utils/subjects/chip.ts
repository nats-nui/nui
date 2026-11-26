import { SubjectHit } from "@/types/Subject"

export type RowChip = { label: string, kind: "live" | "js", title: string }

function norm(value: string): string {
	return value.replace(/^[_$]+/, "").toLowerCase()
}

export function rowChip(hit?: SubjectHit, segment?: string): RowChip | null {
	if (!hit) return null
	if (hit.coreCount != null) return { label: "Core NATS", kind: "live", title: "observed via Core NATS" }
	if (hit.kind == "occupied") return null
	if (hit.kind == "kv" || hit.streams.some(s => s.kind == "kv")) {
		return { label: "Key-Value Store", kind: "js", title: "Key-Value Store bucket" }
	}
	if (hit.kind == "object" || hit.streams.some(s => s.kind == "object")) {
		return { label: "Object Store", kind: "js", title: "Object Store bucket" }
	}
	const stream = hit.streams[0]
	if (!stream) return null
	const label = norm(stream.name)
	if ([segment, hit.subject].some(name => name && norm(name) === label)) return null
	return { label: stream.name, kind: "js", title: `JetStream stream ${stream.name}` }
}
