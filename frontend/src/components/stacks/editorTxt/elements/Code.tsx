import { useMonaco } from "@monaco-editor/react";
import { RenderElementProps, useFocused, useSelected } from "slate-react";
import cls from "./Code.module.css";
import { FunctionComponent } from "react";
import IconButton from "@/components/buttons/IconButton";
import ArrowRightIcon from "@/icons/ArrowRightIcon";
import CopyIcon from "@/icons/CopyIcon";



interface Props extends RenderElementProps {
}

const Code: FunctionComponent<Props> = ({
	attributes,
	element,
	children,
}) => {

	// HOOKs
	const monaco = useMonaco()
	const selected = useSelected()
	const focused = useFocused()

	// HANDLERS
	const handleOpen = () => {
	}
	const handleCopy = () => {
	}

	// RENDER
	const haveFocus = selected && focused
	const cnRoot = `${cls.root} ${haveFocus ? cls.focus : ''} hover-container`
	const clsBtt = `${cls.btt} hover-show`

	return <pre className={cnRoot} {...attributes}>
		<div className={clsBtt}>

			<IconButton
				onClick={handleCopy}
			><CopyIcon /></IconButton>

			<IconButton 
				onClick={handleOpen}
			><ArrowRightIcon /></IconButton>

		</div>
		<code>{children}</code>
	</pre>
}

export default Code