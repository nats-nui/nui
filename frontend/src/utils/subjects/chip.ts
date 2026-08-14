import { SubjectHit } from "@/types/Subject"

export type RowChip = { label: string, kind: "live" | "js", title: string }

function norm(value: string): string {
	return value.replace(/^[_$]+/, "").toLowerCase()
}

function echoes(label: string, ...names: (string | undefined)[]): boolean {
	const want = norm(label)
	return names.some(name => !!name && norm(name) == want)
}

/** One chip, and only when it says something the name does not. */
export function rowChip(hit?: SubjectHit, segment?: string): RowChip | null {
	if (!hit) return null
	if (hit.core) return { label: "live", kind: "live", title: "heard just now" }
	if (hit.kind == "occupied") return null
	if (hit.kind == "kv" || hit.streams.some(s => s.kind == "kv")) {
		return { label: "KV", kind: "js", title: "key/value bucket" }
	}
	if (hit.kind == "object" || hit.streams.some(s => s.kind == "object")) {
		return { label: "FILES", kind: "js", title: "object store" }
	}
	const stream = hit.streams.find(s => s.kind != "kv" && s.kind != "object")
	if (!stream) return null
	if (echoes(stream.name, segment, hit.subject)) return null
	return { label: stream.name, kind: "js", title: `kept by ${stream.name}` }
}
