import { CoreCatalog, JetStreamCatalog, OccupiedCatalog, SubjectHit, SubjectNode } from "@/types/Subject"
import { hasWildcard, isInternalSubject } from "./filter"

export const MAX_TREE_CHILDREN = 50

export function occupiedKey(stream: string, pattern?: string): string {
	return JSON.stringify([stream, pattern || ">"])
}

export function flattenHits(opts: {
	core?: CoreCatalog | null
	jetstream?: JetStreamCatalog | null
	occupied?: Record<string, OccupiedCatalog>
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

	for (const item of opts.core?.subjects ?? []) {
		ensure(item.subject).coreCount = item.count
	}

	if (opts.jetstream) {
		const parents = new Map<string, string | null>()
		for (const stream of opts.jetstream.streams ?? []) {
			for (const item of stream.subjects ?? []) {
				const hit = ensure(item.subject)
				hit.kind = item.kind
				const pattern = item.subject
				const expandable = !stream.transformed && (item.kind == "kv" || item.kind == "object" || item.kind == "pattern" && hasWildcard(pattern))
				hit.streams.push({
					name: stream.name,
					kind: stream.kind,
					pattern: expandable ? pattern : undefined,
					transformed: stream.transformed,
					count: item.count,
				})
				if (stream.transformed) parents.set(occupiedKey(stream.name), null)
				else if (expandable) {
					parents.set(occupiedKey(stream.name, pattern), hit.subject)
				}
			}
		}
		for (const [key, occ] of Object.entries(opts.occupied ?? {})) {
			const parent = parents.get(key)
			if (parent === undefined) continue
			for (const item of occ.subjects ?? []) {
				const hit = ensure(item.subject)
				if (parent && !hit.parent && !hit.streams.some(source => source.pattern)) hit.parent = parent
				hit.kind ??= "occupied"
				const row = hit.streams.find(s => s.name == occ.stream)
				if (row) row.count = item.count
				else hit.streams.push({ name: occ.stream, kind: occ.kind, count: item.count })
			}
		}
	}

	return Array.from(bySubject.values())
		.filter(hit => !opts.noSysMessages || !isInternalSubject(hit.subject))
}

export function buildSubjectTree(hits: SubjectHit[]): SubjectNode[] {
	const root: SubjectNode = { segment: "", path: "", children: [], names: 0 }
	const nodes = new Map<string, SubjectNode>()
	const add = (parent: SubjectNode, path: string, segment: string) => {
		const node: SubjectNode = { path, segment, children: [], names: 0 }
		parent.children.push(node)
		nodes.set(path, node)
		return node
	}
	const insert = (hit: SubjectHit) => {
		const dot = hit.subject.indexOf(".")
		const first = dot < 0 ? hit.subject : hit.subject.slice(0, dot)
		const family = nodes.get(first) ?? add(root, first, first)
		if (dot < 0) family.hit = hit
		else add(family, hit.subject, hit.subject.slice(dot + 1)).hit = hit
	}
	for (const hit of hits) if (!hit.parent) insert(hit)
	for (const hit of hits) {
		if (!hit.parent) continue
		const parent = nodes.get(hit.parent)
		if (!parent?.hit) {
			insert(hit)
			continue
		}
		let prefix = ""
		for (const token of hit.parent.split(".")) {
			if (token == "*" || token == ">") break
			prefix += token + "."
		}
		const segment = hit.subject.startsWith(prefix) ? hit.subject.slice(prefix.length) : hit.subject
		parent.children.push({ segment, path: hit.subject, children: [], names: 0, hit })
	}
	countAndSort(root)
	return root.children
}

function countAndSort(node: SubjectNode): number {
	node.names = node.hit ? 1 : 0
	for (const child of node.children) node.names += countAndSort(child)
	node.children.sort((a, b) => a.segment.localeCompare(b.segment))
	if (node.children.length > MAX_TREE_CHILDREN) {
		const hidden = node.children.splice(MAX_TREE_CHILDREN)
		node.children.push({
			segment: `… ${hidden.length} more`,
			path: node.path ? `${node.path}.__more` : "__more",
			children: [],
			names: hidden.reduce((count, child) => count + child.names, 0),
			remainder: true,
		})
	}
	return node.names
}

export function filterHits(hits: SubjectHit[], text: string): SubjectHit[] {
	const needle = text?.toLocaleLowerCase()?.trim()
	if (!needle) return hits
	return hits.filter(hit =>
		hit.subject.toLowerCase().includes(needle)
		|| hit.streams.some(s => s.name.toLowerCase().includes(needle)),
	)
}
