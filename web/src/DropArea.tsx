import mouseSo, { MouseState } from "@/stores/mouse"
import { useStore } from "@priolo/jon"
import { DragEvent, FunctionComponent } from "react"


interface Props {
	index?: number
}

const DropArea: FunctionComponent<Props> = ({
	index
}) => {

	// STORES
	const mouseSa = useStore(mouseSo) as MouseState

	// HOOKS

	// HANDLERS
	const handleMouseOver = (_: DragEvent<HTMLDivElement>) => {
		if (mouseSa.drag?.srcView == null) return
		mouseSo.setDrag({
			...mouseSa.drag,
			index,
		})
	}
	const handleMouseLeave = () => {
		if (mouseSa.drag?.srcView == null) return
		mouseSo.setDrag({
			...mouseSa.drag,
			index: null,
		})
	}

	// RENDER
	const dragOver = mouseSa.drag?.index == index
	const css = {
		...cssDroppable(false),
		...(dragOver && cssDragOver)
	}

	return <div style={css} draggable={false}
		onMouseOver={handleMouseOver}
		onMouseLeave={handleMouseLeave}
	/>

}

export default DropArea

const cssDroppable = (last: boolean): React.CSSProperties => ({
	width: last ? "200px" : "35px",
	backgroundColor: "green",
	transition: 'width 0.4s ease-in-out',
})

const cssDragOver: React.CSSProperties = {
	width: "100px",
	transition: 'width 0.4s ease-in-out',
}