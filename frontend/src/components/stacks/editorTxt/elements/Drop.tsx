import { FunctionComponent, HTMLProps, useState } from "react"
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from "slate-react"
import cls from "./Drop.module.css"
import mouseSo from "@/stores/mouse"
import { SugarEditor } from "@/stores/stacks/editor/utils/withSugar"
import { useStore } from "@priolo/jon"
import { NODE_TYPES, NodeType } from "@/stores/stacks/editor/utils/types"




const Drop: FunctionComponent<RenderElementProps & HTMLProps<HTMLDivElement>> = ({
	attributes,
	element,
	children,
	className,
	...props
}) => {

	// STORES
	const mouseSa = useStore(mouseSo)

	// HOOKs
	const editor = useSlate() as SugarEditor

	// HANDLERS
	const handleMouseOver = (_: React.DragEvent<HTMLDivElement>) => {
		if (!mouseSo.state.drag?.source?.view) return
		const path = ReactEditor.findPath(editor, element)
		mouseSo.setDrag({
			source: { ...mouseSo.state.drag.source },
			destination: { view: editor.view, index: path?.[0] },
		})
	}
	const handleMouseLeave = () => {
		if (!mouseSo.state.drag?.source?.view) return
		mouseSo.setDrag({
			source: { ...mouseSo.state.drag.source },
			destination: null,
		})
	}


	// RENDER
	const clsDrag = !!mouseSa.drag?.source ? cls.drag : ""
	const cnRoot = `${clsDrag} ${className}`

	return <div {...attributes}
		className={cnRoot}
		onMouseOver={handleMouseOver}
		onMouseLeave={handleMouseLeave}
		{...props}
	>
		{children}
	</div>
}

export default Drop