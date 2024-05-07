import styles from "./Chapter.module.css"
import { useFocused, useSelected } from "slate-react"


export default function Chapter({
	attributes, 
	element,
	doc,
	children, 
}) {

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