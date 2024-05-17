import IconButton from "@/components/buttons/IconButton"
import CardIcon from "@/components/cards/CardIcon"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import CloseIcon from "@/icons/CloseIcon"
import { GetAllCards, deckCardsSo } from "@/stores/docs/cards"
import { buildStore } from "@/stores/docs/utils/factory"
import { getById } from "@/stores/docs/utils/manage"
import { ElementCard } from "@/stores/stacks/editor/utils/types"
import { ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { FunctionComponent } from "react"
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlate } from "slate-react"
import cls from "./Card.module.css"
import { SugarEditor } from "@/stores/stacks/editor/utils/withSugar"
import mouseSo from "@/stores/mouse"
import Drop from "./Drop"



export interface CardProps extends RenderElementProps {
	element: ElementCard
}

const Card: FunctionComponent<CardProps> = ({
	attributes,
	element,
	children,
}) => {

	// HOOKs
	const editor = useSlate() as SugarEditor
	const selected = useSelected()
	const focused = useFocused()

	// HANDLERS
	const handleOpen = () => {
		let view: ViewStore = getById(GetAllCards(), element.data?.uuid)
		if (!!view) {
			view.state.group?.focus(view)
			return
		}
		view = buildStore({ type: element.data.type, group: deckCardsSo })
		if (!view) return
		view.setSerialization(element.data)
		editor.view.state.group.addLink({ view, parent: editor.view, anim: true })
	}
	const handleRemove = () => {
		const path = ReactEditor.findPath(editor, element)
		editor.removeNodes({ at: path })
	}
	const handleClick = () => {
		const path = ReactEditor.findPath(editor, element)
		editor.select(path)
	}
	const handleDragStart: React.DragEventHandler = (e) => {
		e.preventDefault();
		const path = ReactEditor.findPath(editor, element)
		mouseSo.setPosition({ x: e.clientX, y: e.clientY })
		mouseSo.startDrag({ source: { view: editor.view, index: path?.[0] } })
	}

	// RENDER
	const clsFocus = selected && focused ? cls.focus : ''
	const clsRoot = `${cls.root} ${clsFocus} hover-container`
	const styColor = `var(--var-${element.colorVar})`
	const cardType: DOC_TYPE = element.data.type

	return <Drop
		attributes={attributes}
		element={element}
		contentEditable={false}
		draggable
		className={clsRoot}
		onDragStart={handleDragStart}
		onClick={handleClick}
	>

		<CardIcon type={cardType} style={{ color: styColor }} />

		<div className={cls.label}>
			<div className={cls.title}>
				{children}
			</div>
			<div className={cls.subtitle}>
				{element.subtitle}
			</div>
		</div>

		<IconButton
			className={`${cls.bttClose} hover-show`}
			onClick={handleRemove}
		><CloseIcon /></IconButton>

		<IconButton
			onClick={handleOpen}
		><ArrowRightIcon /></IconButton>

	</Drop>
}

export default Card