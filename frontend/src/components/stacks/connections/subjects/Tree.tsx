import { OccupiedCatalog, SubjectNode, SubjectSource } from "@/types/Subject"
import { rowChip } from "@/utils/subjects/chip"
import { leafTitle } from "@/utils/subjects/copy"
import { occupiedKey } from "@/utils/subjects/tree"
import { Button, CopyButton } from "@priolo/jack"
import { FunctionComponent, useState } from "react"
import cls from "./Tree.module.css"

interface Props {
	nodes: SubjectNode[]
	search?: string
	revealMatches?: boolean
	select?: string
	onSelect?: (subject: string) => void
	onExpand?: (source: SubjectSource) => void
	empty?: string
	occupied?: Record<string, OccupiedCatalog>
	occupiedLoading?: Record<string, AbortController>
}

const SubjectTree: FunctionComponent<Props> = ({
	nodes, empty, search, ...treeProps
}) => {
	const [browsePaths, setBrowsePaths] = useState(new Map<string, boolean>())
	const [find, setFind] = useState<{ search: string, paths: Map<string, boolean> }>()
	const openPaths = search ? (find?.search === search ? find.paths : undefined) : browsePaths
	if (!nodes || nodes.length == 0) {
		return empty ? <div className={`jack-lbl-empty color-fg ${cls.empty}`}>{empty}</div> : null
	}
	const setOpen = (path: string, open: boolean) => {
		const paths = new Map(openPaths).set(path, open)
		if (search) setFind({ search, paths })
		else setBrowsePaths(paths)
	}
	return <div className={cls.root}>
		{nodes.map(node => (
			<TreeNode
				key={`${node.remainder ? "more" : "subject"}:${node.path}`}
				node={node}
				{...treeProps}
				openPaths={openPaths}
				setOpen={setOpen}
			/>
		))}
	</div>
}

export default SubjectTree

interface NodeProps extends Omit<Props, "nodes" | "empty" | "search"> {
	node: SubjectNode
	openPaths?: Map<string, boolean>
	setOpen: (path: string, open: boolean) => void
}

const TreeNode: FunctionComponent<NodeProps> = ({
	node, ...treeProps
}) => {
	if (node.remainder) return <div className={cls.remainder}>{node.segment}</div>
	const { select, onSelect, onExpand, occupied, occupiedLoading, openPaths, setOpen } = treeProps
	const hasChildren = node.children.length > 0
	const open = openPaths?.get(node.path) ?? (treeProps.revealMatches && hasChildren)
	const selected = !!node.hit && node.path == select
	const sources = node.hit?.streams.filter(source => source.pattern) ?? []
	const singleSource = sources.length == 1 ? sources[0] : undefined
	const key = singleSource && occupiedKey(singleSource.name, singleSource.pattern)
	const occ = key ? occupied?.[key] : undefined
	const loadingOcc = !!key && !!occupiedLoading?.[key]
	const loadedEmpty = !!occ && !occ.error && occ.subjects.length == 0 && !hasChildren
	const canOpen = hasChildren || (sources.length > 0 && !loadedEmpty)
	const title = node.hit ? leafTitle(node.path, node.hit.coreCount, node.hit.streams) : node.path
	const chip = rowChip(node.hit, node.segment)

	const expand = () => {
		setOpen(node.path, !open)
		if (!open && singleSource && (!occ || occ.error) && !loadingOcc) onExpand?.(singleSource)
	}

	return (
		<div>
			<div className={`${cls.node} ${selected ? cls.selected : ""} jack-hover-container`} title={title}>
				{canOpen && <button type="button" className={cls.twist} onClick={expand}
					aria-label={`${open ? "Collapse" : "Expand"} ${node.path}`} aria-expanded={!!open}>
					{open ? "▾" : "▸"}
				</button>}
				<button type="button" className={cls.entry}
					aria-pressed={node.hit ? selected : undefined}
					aria-expanded={node.hit ? undefined : !!open}
					onClick={node.hit ? () => onSelect?.(node.path) : expand}>
					<span className={cls.segment}>{node.segment}</span>
					{chip && <span className={`${cls.chip} ${chip.kind == "live" ? cls.core : cls.js}`} title={chip.title}>{chip.label}</span>}
					{loadingOcc && <span className={cls.count}>loading</span>}
					{loadedEmpty && !occ.truncated && <span className={cls.count}>no visible matches</span>}
					{occ?.error && <span className={cls.count} title={occ.error}>cannot list</span>}
					{canOpen && !open && node.names > 1 && <span className={cls.count}>{node.names}</span>}
				</button>
				{node.hit && <CopyButton absolute value={node.path} label="COPY SUBJECT" />}
			</div>
			{open && (hasChildren || sources.length > 1) && (
				<div className={cls.children}>
					{sources.length > 1 && sources.map(source => {
						const key = occupiedKey(source.name, source.pattern)
						const result = occupied?.[key]
						const loading = !!occupiedLoading?.[key]
						return <div className={cls.source} key={key}>
							{result && !result.error
								? <span>{source.name}</span>
								: <Button disabled={loading} onClick={() => onExpand?.(source)}>
									{result?.error ? "RETRY" : "BROWSE STORED SUBJECTS"} · {source.name}
								</Button>}
							<span className={cls.count} role="status" title={result?.error}>
								{loading ? "loading" : result?.error ? "cannot list" : result?.subjects.length == 0 && !result.truncated ? "no visible matches" : null}
							</span>
						</div>
					})}
					{node.children.map(child => (
						<TreeNode
							key={`${child.remainder ? "more" : "subject"}:${child.path}`}
							node={child}
							{...treeProps}
						/>
					))}
				</div>
			)}
		</div>
	)
}
