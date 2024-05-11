import { RenderElementProps, useFocused, useSelected } from "slate-react"
import styles from "./Paragraph.module.css"
import { FunctionComponent } from "react"



interface Props extends RenderElementProps {
} 

const Paragraph: FunctionComponent<Props> = ({
	attributes, 
	element,
	children, 
}) => {

	// HOOKs
	const selected = useSelected()
	const focused = useFocused()

	// RENDER
	const cnText = `${styles.root} ${selected && focused ? styles.focus : ''}`
	return ( 
		<p className={cnText} {...attributes}>
			{children}
		</p>
	)
}

export default Paragraph