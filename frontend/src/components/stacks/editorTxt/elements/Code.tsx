import { useMonaco } from "@monaco-editor/react";
import { RenderElementProps, useFocused, useSelected } from "slate-react";
import cls from "./Code.module.css";
import { FunctionComponent } from "react";
import IconButton from "@/components/buttons/IconButton";
import ArrowRightIcon from "@/icons/ArrowRightIcon";
import CopyIcon from "@/icons/CopyIcon";
import CopyButton from "@/components/buttons/CopyButton";
import { Node } from "slate";
import Drop from "./Drop";



interface Props extends RenderElementProps {
}

const Code: FunctionComponent<Props> = ({
	attributes,
	element,
	children,
}) => {

	// HOOKs
	const selected = useSelected()
	const focused = useFocused()

	// HANDLERS
	const handleOpen = () => {
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

			<IconButton 
				onClick={handleOpen}
			><ArrowRightIcon /></IconButton>

		</div>
		{children}
	</Drop>
}

export default Code