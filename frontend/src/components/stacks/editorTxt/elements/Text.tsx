import { FunctionComponent } from "react"
import { RenderElementProps, useFocused, useSelected } from "slate-react"
import Drop from "./Drop"
import cls from "./Text.module.css"



interface Props extends RenderElementProps {
}

const Text: FunctionComponent<Props> = ({
	attributes,
	element,
	children,
}) => {

	// STORES

	// HOOKs
	const selected = useSelected()
	const focused = useFocused()

	// HANDLERS

	// RENDER
	const clsFocus = selected && focused ? cls.focus : ''
	const clsRoot = `${cls.root} ${clsFocus}`

	return <Drop
		attributes={attributes}
		element={element}
		className={clsRoot}
	>
		{children}
	</Drop>
}

export default Text