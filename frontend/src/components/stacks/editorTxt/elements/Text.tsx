import { FunctionComponent } from "react"
import { RenderElementProps, useFocused, useSelected } from "slate-react"
import cls from "./Text.module.css"



interface Props extends RenderElementProps {
} 

const Text: FunctionComponent<Props> = ({
	attributes, 
	element,
	children, 
}) => {

	// HOOKs
	const selected = useSelected()
	const focused = useFocused()
	 

	// RENDER
	const cnText = `${cls.root} ${selected && focused ? cls.focus : ''}`
	return ( 
		<div className={cnText} {...attributes}>
			{children}
		</div>
	)
}

export default Text