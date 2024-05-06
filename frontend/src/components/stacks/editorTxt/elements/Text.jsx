import { useFocused, useSelected } from "slate-react"
import styles from "./Text.module.css"


export default function Text({
	attributes, 
	element,
	doc,
	children, 
}) {

	// HOOKs
	const selected = false//useSelected()
	const focused = false//useFocused()
	 

	// RENDER
	const cnText = `${styles.root} ${selected && focused ? styles.focus : ''}`
	return ( 
		<p className={cnText} {...attributes}>
			{children}
		</p>
	)
}