export type SubjectKind = "live" | "pattern" | "occupied" | "kv" | "object"

export interface CoreSubjectHit {
	subject: string
	count: number
}

export interface JetStreamSubjectHit {
	subject: string
	pattern?: string
	kind: "pattern" | "occupied" | "kv" | "object"
	count?: number
}

export interface JetStreamStreamHit {
	name: string
	kind: "stream" | "kv" | "object"
	truncated?: boolean
	subjects: JetStreamSubjectHit[]
}

export interface CoreCatalog {
	filter: string
	listenMs: number
	heard: number
	truncated: boolean
	dropped?: number
	error?: string
	subjects: CoreSubjectHit[]
}

export interface JetStreamCatalog {
	error?: string
	failed?: number
	truncated?: boolean
	streams: JetStreamStreamHit[]
}

export interface OccupiedCatalog {
	stream: string
	kind?: string
	truncated?: boolean
	error?: string
	subjects: JetStreamSubjectHit[]
}

export interface SubjectHit {
	subject: string
	kind?: SubjectKind
	core?: { count: number }
	streams: { name: string, kind?: string, count?: number, pattern?: string }[]
	expandable?: boolean
}

export interface SubjectNode {
	segment: string
	path: string
	children: SubjectNode[]
	hit?: SubjectHit
	names: number
	remainder?: boolean
	stacked?: boolean
}
