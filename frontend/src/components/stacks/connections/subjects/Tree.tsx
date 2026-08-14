import { OccupiedCatalog, SubjectNode } from "@/types/Subject"
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
}

const SubjectTree: FunctionComponent<Props> = ({ nodes, select, onSelect, empty, occupied, occupiedLoading }) => {
	if (!nodes || nodes.length == 0) {
		return <div className={`jack-lbl-empty color-fg ${cls.empty}`}>{empty ?? "No names to show."}</div>
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
}

function occKeyFor(node: SubjectNode): string | null {
	const stream = node.hit?.expandable ? node.hit.streams[0] : null
	if (!stream) return null
	return occupiedKey(stream.name, stream.pattern)
}

const TreeNode: FunctionComponent<NodeProps> = memo(({ node, select, onSelect, occupied, occupiedLoading }) => {
	const hasChildren = node.children.length > 0
	const [open, setOpen] = useState(false)
	const selected = !!node.hit && node.path == select
	const key = occKeyFor(node)
	const occ = key ? occupied?.[key] : undefined
	const loadingOcc = !!key && occupiedLoading == key
	const loadedEmpty = !!node.hit?.expandable && !!occ && (occ.subjects?.length ?? 0) == 0 && !hasChildren
	const clsNode = `${cls.node} ${selected ? cls.selected : ""} ${node.remainder ? cls.remainder : ""}`
	const title = node.remainder
		? node.segment
		: node.hit
			? leafTitle(node.path, node.hit.core?.count, node.hit.streams)
			: node.path

	const handleTwist = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (hasChildren) {
			setOpen(!open)
			return
		}
		if (node.hit?.expandable && !loadedEmpty) {
			setOpen(true)
			onSelect?.(node)
		}
	}
	const handleClick = () => {
		if (node.remainder) return
		if (node.hit?.expandable) {
			setOpen(true)
			if (!loadedEmpty) onSelect?.(node)
			return
		}
		if (node.hit) onSelect?.(node)
		else if (hasChildren) setOpen(!open)
	}

	const kindChip = (node.hit?.kind == "kv" || node.hit?.streams.some(s => s.kind == "kv")) ? "KV"
		: (node.hit?.kind == "object" || node.hit?.streams.some(s => s.kind == "object")) ? "FILES"
			: null

	return (
		<div>
			<div className={clsNode} onClick={handleClick} title={title}>
				<div className={cls.twist} onClick={handleTwist}>
					{hasChildren ? (open ? "▾" : "▸") : node.hit?.expandable && !loadedEmpty ? "▸" : ""}
				</div>
				<div className={cls.segment}>{node.segment}</div>
				<div className={cls.meta}>
					{node.hit?.core && <span className={`${cls.chip} ${cls.core}`}>live</span>}
					{kindChip && <span className={`${cls.chip} ${cls.js}`} title={kindChip == "KV" ? "key/value bucket" : "object store"}>{kindChip}</span>}
					{node.hit?.streams.filter(s => s.kind != "kv" && s.kind != "object").map(s => (
						<span key={s.name} className={`${cls.chip} ${cls.js}`} title={`kept by ${s.name}`}>{s.name}</span>
					))}
					{loadingOcc && <span className={cls.count}>loading</span>}
					{loadedEmpty && !occ?.error && <span className={cls.count}>none stored</span>}
					{occ?.error && <span className={cls.count}>{occ.error}</span>}
					{!node.hit && !node.remainder && node.names > 0 && !open && <span className={cls.count}>{node.names}</span>}
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
						/>
					))}
				</div>
			)}
		</div>
	)
})
