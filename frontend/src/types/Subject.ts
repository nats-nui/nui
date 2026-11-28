type SubjectKind = "pattern" | "occupied" | "kv" | "object"

export interface CoreSubjectHit {
	subject: string
	count: number
}

export interface JetStreamSubjectHit {
	subject: string
	pattern?: string
	kind: SubjectKind
	count?: number
}

export interface JetStreamStreamHit {
	name: string
	kind: "stream" | "kv" | "object"
	transformed?: boolean
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

export interface SubjectSource {
	name: string
	kind?: string
	count?: number
	transformed?: boolean
	/** Filter for browsing stored subjects when this source can expand. */
	pattern?: string
}

export interface SubjectHit {
	subject: string
	parent?: string
	kind?: SubjectKind
	coreCount?: number
	streams: SubjectSource[]
}

export interface SubjectNode {
	segment: string
	path: string
	children: SubjectNode[]
	hit?: SubjectHit
	names: number
	remainder?: boolean
}
