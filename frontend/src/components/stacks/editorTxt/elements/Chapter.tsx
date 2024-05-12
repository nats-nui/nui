import { FunctionComponent } from "react"
import styles from "./Chapter.module.css"
import { RenderElementProps, useFocused, useSelected } from "slate-react"
import Drop from "./Drop"



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
	const cnRoot = `${styles.root} ${selected && focused ? styles.focus : ''}`

	return <Drop
		attributes={attributes}
		element={element}
		className={cnRoot}
	>
		{children}
	</Drop>
}

export default Chapter