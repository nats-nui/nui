import CopyButton from "@/components/buttons/CopyButton";
import IconButton from "@/components/buttons/IconButton";
import ArrowRightIcon from "@/icons/ArrowRightIcon";
import { GetAllCards } from "@/stores/docs/cards";
import { getById } from "@/stores/docs/utils/manage";
import { ElementCard } from "@/stores/stacks/editor/utils/types";
import { SugarEditor } from "@/stores/stacks/editor/utils/withSugar";
import { buildCodeEditor } from "@/stores/stacks/editorCode/factory";
import { ViewStore } from "@/stores/stacks/viewBase";
import { FunctionComponent } from "react";
import { Node } from "slate";
import { RenderElementProps, useFocused, useSelected, useSlate } from "slate-react";
import cls from "./Code.module.css";
import Drop from "./Drop";



interface Props extends RenderElementProps {
	element: ElementCard
}



const Code: FunctionComponent<Props> = ({
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
		const text = Node.string(element)
		view = buildCodeEditor(text)
		if (!view) return
		editor.view.state.group.addLink({ view, parent: editor.view, anim: true })
	}
	const handleCopy = () => Node.string(element)

	// RENDER
	const haveFocus = selected && focused
	const clsRoot = `${cls.root} ${haveFocus ? cls.focus : ''} hover-container`
	const clsBtt = `${cls.btt} hover-show`

	return <Drop 
		attributes={attributes}
		element={element}
		className={clsRoot} 
	>
		<div className={clsBtt}>

			<CopyButton value={handleCopy} />

			{/* <IconButton 
				onClick={handleOpen}
			><ArrowRightIcon /></IconButton> */}

		</div>
		{children}
	</Drop>
}

export default Code

