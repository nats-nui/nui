import { CoreCatalog, JetStreamCatalog, OccupiedCatalog, SubjectHit, SubjectNode } from "@/types/Subject"

export const MAX_TREE_CHILDREN = 50
// Family at the first token. Anything deeper is one stacked name, not a
// nested inbox of heartbeats, keys, and notification leaves.
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
				hit.expandable = item.kind == "pattern" || item.kind == "kv" || item.kind == "object"
				hit.streams.push({
					name: stream.name,
					kind: stream.kind,
					pattern: item.pattern,
					count: item.count,
				})
			}
		}
		for (const occ of Object.values(opts.occupied ?? {})) {
			for (const item of occ.subjects ?? []) {
				const hit = ensure(item.subject)
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

	return Array.from(bySubject.values()).sort((a, b) => a.subject.localeCompare(b.subject))
}

type Draft = {
	segment: string
	path: string
	children: Map<string, Draft>
	hit?: SubjectHit
	stacked?: boolean
}

export function buildSubjectTree(hits: SubjectHit[]): SubjectNode[] {
	const root: Draft = { segment: "", path: "", children: new Map() }
	for (const hit of hits) {
		const segments = hit.subject.split(".").filter(s => s.length > 0)
		if (segments.length == 0) continue
		let current = root
		let i = 0
		while (i < segments.length) {
			const remaining = segments.length - i
			const stacked = i >= MAX_TREE_DEPTH - 1 && remaining > 1
			const take = stacked ? remaining : 1
			const segment = segments.slice(i, i + take).join(".")
			const path = segments.slice(0, i + take).join(".")
			let child = current.children.get(segment)
			if (!child) {
				child = { segment, path, children: new Map(), stacked }
				current.children.set(segment, child)
			}
			current = child
			i += take
		}
		current.hit = hit
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
		stacked: draft.stacked,
	}
}

export function filterTree(nodes: SubjectNode[], text: string): SubjectNode[] {
	const needle = text?.toLocaleLowerCase()?.trim()
	if (!needle) return nodes
	const keep = (node: SubjectNode): SubjectNode | null => {
		if (node.remainder) return null
		const children = node.children.map(keep).filter(Boolean) as SubjectNode[]
		const selfMatch = node.path.toLowerCase().includes(needle)
			|| node.hit?.streams.some(s => s.name.toLowerCase().includes(needle))
		if (!selfMatch && children.length == 0) return null
		let names = node.hit ? 1 : 0
		for (const child of children) names += child.names
		return { ...node, children, names }
	}
	return nodes.map(keep).filter(Boolean) as SubjectNode[]
}

export function countLeaves(nodes: SubjectNode[]): number {
	let n = 0
	for (const node of nodes) n += node.names
	return n
}
