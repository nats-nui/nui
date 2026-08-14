import { OccupiedCatalog, SubjectNode } from "@/types/Subject"
import { rowChip } from "@/utils/subjects/chip"
import { leafTitle } from "@/utils/subjects/copy"
import { occupiedKey } from "@/utils/subjects/tree"
import { FunctionComponent, memo, useState } from "react"
import cls from "./Tree.module.css"

interface Props {
	nodes: SubjectNode[]
	select?: string
	onSelect?: (node: SubjectNode) => void
	empty?: string
	occupied?: Record<string, OccupiedCatalog>
	occupiedLoading?: string
	reveal?: boolean
}

const SubjectTree: FunctionComponent<Props> = ({
	nodes, select, onSelect, empty, occupied, occupiedLoading, reveal,
}) => {
	const [openPaths, setOpenPaths] = useState<Record<string, boolean>>({})
	if (!nodes || nodes.length == 0) {
		return <div className={`jack-lbl-empty color-fg ${cls.empty}`}>{empty ?? "No names to show."}</div>
	}
	const setOpen = (path: string, open: boolean) => {
		setOpenPaths(prev => (prev[path] == open ? prev : { ...prev, [path]: open }))
	}
	return <div className={cls.root}>
		{nodes.map(node => (
			<TreeNode
				key={node.path}
				node={node}
				select={select}
				onSelect={onSelect}
				occupied={occupied}
				occupiedLoading={occupiedLoading}
				reveal={!!reveal}
				openPaths={openPaths}
				setOpen={setOpen}
			/>
		))}
	</div>
}

export default SubjectTree

interface NodeProps {
	node: SubjectNode
	select?: string
	onSelect?: (node: SubjectNode) => void
	occupied?: Record<string, OccupiedCatalog>
	occupiedLoading?: string
	reveal: boolean
	openPaths: Record<string, boolean>
	setOpen: (path: string, open: boolean) => void
}

function occKeyFor(node: SubjectNode): string | null {
	const stream = node.hit?.expandable ? node.hit.streams[0] : null
	if (!stream) return null
	return occupiedKey(stream.name, stream.pattern)
}

const TreeNode: FunctionComponent<NodeProps> = memo(({
	node, select, onSelect, occupied, occupiedLoading, reveal, openPaths, setOpen,
}) => {
	const hasChildren = node.children.length > 0
	const open = reveal || !!openPaths[node.path]
	const selected = !!node.hit && node.path == select
	const key = occKeyFor(node)
	const occ = key ? occupied?.[key] : undefined
	const loadingOcc = !!key && occupiedLoading == key
	const loadedEmpty = !!node.hit?.expandable && !!occ && (occ.subjects?.length ?? 0) == 0 && !hasChildren
	const canOpen = hasChildren || (!!node.hit?.expandable && !loadedEmpty)
	const clsNode = `${cls.node} ${selected ? cls.selected : ""} ${node.remainder ? cls.remainder : ""} ${node.stacked ? cls.stacked : ""}`
	const title = node.remainder
		? node.segment
		: node.hit
			? leafTitle(node.path, node.hit.core?.count, node.hit.streams)
			: node.path
	const chip = rowChip(node.hit, node.segment)

	const activate = () => {
		if (node.remainder) return
		if (canOpen) {
			const next = !open
			if (!reveal) setOpen(node.path, next)
			if (next && node.hit?.expandable && !occ && !loadingOcc) onSelect?.(node)
			return
		}
		if (node.hit) onSelect?.(node)
	}

	return (
		<div>
			<div className={clsNode} onClick={activate} title={title}>
				<div className={cls.twist} onClick={e => { e.stopPropagation(); activate() }}>
					{canOpen ? (open ? "▾" : "▸") : ""}
				</div>
				<div className={cls.segment}>{node.segment}</div>
				<div className={cls.meta}>
					{chip && <span className={`${cls.chip} ${chip.kind == "live" ? cls.core : cls.js}`} title={chip.title}>{chip.label}</span>}
					{loadingOcc && <span className={cls.count}>loading</span>}
					{loadedEmpty && !occ?.error && <span className={cls.count}>none stored</span>}
					{occ?.error && <span className={cls.count}>{occ.error}</span>}
					{canOpen && !open && node.names > 1 && <span className={cls.count}>{node.names}</span>}
					{node.remainder && <span className={cls.count}>{node.names}</span>}
				</div>
			</div>
			{hasChildren && open && (
				<div className={cls.children}>
					{node.children.map(child => (
						<TreeNode
							key={child.path}
							node={child}
							select={select}
							onSelect={onSelect}
							occupied={occupied}
							occupiedLoading={occupiedLoading}
							reveal={reveal}
							openPaths={openPaths}
							setOpen={setOpen}
						/>
					))}
				</div>
			)}
		</div>
	)
})
