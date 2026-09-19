import { CoreCatalog, JetStreamCatalog, OccupiedCatalog, SubjectHit, SubjectNode } from "@/types/Subject"

export const MAX_TREE_CHILDREN = 50
// First token is the family. Anything deeper is one stacked name.
export const MAX_TREE_DEPTH = 2

export function occupiedKey(stream: string, pattern?: string): string {
	return `${stream}::${pattern || ">"}`
}

export function flattenHits(opts: {
	core?: CoreCatalog | null
	jetstream?: JetStreamCatalog | null
	occupied?: Record<string, OccupiedCatalog>
	showCore: boolean
	showJetStream: boolean
	filter?: string
	noSysMessages?: boolean
}): SubjectHit[] {
	const bySubject = new Map<string, SubjectHit>()

	const ensure = (subject: string): SubjectHit => {
		let hit = bySubject.get(subject)
		if (!hit) {
			hit = { subject, streams: [] }
			bySubject.set(subject, hit)
		}
		return hit
	}

	if (opts.showCore && opts.core) {
		const typed = opts.filter
		const stale = typed != null && !!opts.core.filter && opts.core.filter != typed.trim()
		if (!stale) {
			for (const item of opts.core.subjects ?? []) {
				const hit = ensure(item.subject)
				hit.core = { count: item.count }
				if (!hit.kind) hit.kind = "live"
			}
		}
	}

	if (opts.showJetStream && opts.jetstream) {
		for (const stream of opts.jetstream.streams ?? []) {
			for (const item of stream.subjects ?? []) {
				const hit = ensure(item.subject)
				hit.kind = item.kind
				hit.expandable = item.kind == "kv" || item.kind == "object" || item.kind == "pattern" && /[*>]/.test(item.pattern ?? item.subject)
				hit.streams.push({
					name: stream.name,
					kind: stream.kind,
					pattern: item.pattern,
					count: item.count,
				})
			}
		}
		for (const [key, occ] of Object.entries(opts.occupied ?? {})) {
			const parent = Array.from(bySubject.values()).find(hit => hit.expandable && hit.streams.some(s => occupiedKey(s.name, s.pattern) == key))
			for (const item of occ.subjects ?? []) {
				const already = bySubject.get(item.subject)
				if (already?.expandable) continue
				const hit = ensure(item.subject)
				if (parent && parent.subject != hit.subject && !hit.parent) hit.parent = parent.subject
				if (!hit.kind || hit.kind == "live") hit.kind = "occupied"
				if (!hit.streams.some(s => s.name == occ.stream)) {
					hit.streams.push({ name: occ.stream, kind: occ.kind, count: item.count })
				} else {
					const row = hit.streams.find(s => s.name == occ.stream)
					if (row) row.count = item.count
				}
			}
		}
	}

	return Array.from(bySubject.values())
		.filter(hit => !opts.noSysMessages || !/^(\$SYS|\$JS|_INBOX)(\.|$)/.test(hit.subject))
		.sort((a, b) => a.subject.localeCompare(b.subject))
}

type Draft = {
	segment: string
	path: string
	children: Map<string, Draft>
	hit?: SubjectHit
}

export function buildSubjectTree(hits: SubjectHit[]): SubjectNode[] {
	const root: Draft = { segment: "", path: "", children: new Map() }
	const nodes = new Map<string, Draft>()
	const insert = (hit: SubjectHit) => {
		const segments = hit.subject.split(".")
		let current = root
		for (let i = 0; i < segments.length;) {
			const take = i >= MAX_TREE_DEPTH - 1 ? segments.length - i : 1
			const segment = segments.slice(i, i + take).join(".")
			const path = segments.slice(0, i + take).join(".")
			let child = current.children.get(segment)
			if (!child) {
				child = { segment, path, children: new Map() }
				current.children.set(segment, child)
			}
			current = child
			i += take
		}
		current.hit = hit
		nodes.set(hit.subject, current)
	}
	for (const hit of hits) if (!hit.parent) insert(hit)
	for (const hit of hits) {
		if (!hit.parent) continue
		const parent = nodes.get(hit.parent)
		if (!parent) { insert(hit); continue }
		const prefix = hit.parent.split(".").filter(s => s != "*" && s != ">").join(".") + "."
		const segment = hit.subject.startsWith(prefix) ? hit.subject.slice(prefix.length) : hit.subject
		parent.children.set(hit.subject, { segment, path: hit.subject, children: new Map(), hit })
	}
	return freeze(root).children
}
function freeze(draft: Draft): SubjectNode {
	const all = Array.from(draft.children.values())
		.sort((a, b) => a.segment.localeCompare(b.segment))
		.map(freeze)
	const children = all.slice(0, MAX_TREE_CHILDREN)
	if (all.length > MAX_TREE_CHILDREN) {
		const hidden = all.slice(MAX_TREE_CHILDREN)
		let hiddenNames = 0
		for (const child of hidden) hiddenNames += child.names
		children.push({
			segment: `… ${hidden.length} more`,
			path: draft.path ? `${draft.path}.__more` : "__more",
			children: [],
			names: hiddenNames,
			remainder: true,
		})
	}
	let names = draft.hit ? 1 : 0
	for (const child of children) names += child.names
	return {
		segment: draft.segment,
		path: draft.path,
		children,
		hit: draft.hit,
		names,
	}
}

export function filterHits(hits: SubjectHit[], text: string): SubjectHit[] {
	const needle = text?.toLocaleLowerCase()?.trim()
	if (!needle) return hits
	return hits.filter(hit =>
		hit.subject.toLowerCase().includes(needle)
		|| hit.streams.some(s => s.name.toLowerCase().includes(needle)),
	)
}
