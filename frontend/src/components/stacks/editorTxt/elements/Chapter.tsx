import { FunctionComponent } from "react"
import styles from "./Chapter.module.css"
import { RenderElementProps, useFocused, useSelected } from "slate-react"



interface Props extends RenderElementProps {
} 

const Chapter: FunctionComponent<Props> = ({
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

export default Chapter