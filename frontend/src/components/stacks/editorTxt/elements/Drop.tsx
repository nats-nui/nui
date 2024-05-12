import { FunctionComponent, HTMLProps, useState } from "react"
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from "slate-react"
import cls from "./Drop.module.css"
import mouseSo from "@/stores/mouse"
import { SugarEditor } from "@/stores/stacks/editor/utils/withSugar"
import { useStore } from "@priolo/jon"




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
		if (mouseSo.state.drag?.srcView == null) return
		const path = ReactEditor.findPath(editor, element)
		mouseSo.setDrag({
			...mouseSo.state.drag,
			index: path?.[0],
			dstView: editor.view,
			groupDest: null,
		})
	}
	const handleMouseLeave = () => {
		if (mouseSo.state.drag?.srcView == null) return
		mouseSo.setDrag({
			...mouseSo.state.drag,
			index: null,
			dstView: null,
			groupDest: null,
		})
	}

	// RENDER
	const clsDrag = !!mouseSa.drag ? cls.drag : ""
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