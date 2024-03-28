import { FunctionComponent, useMemo } from "react"
import cls from "./TextRow.module.css"



interface Props {
	text?: string
	maxChar?: number
	error?: boolean
	style?: React.CSSProperties
}

const TextRow: FunctionComponent<Props> = ({
	text,
	maxChar = 200,
	error,
	style,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!text) return null
	// accorcio la stringa se è troppo lunga
	const render = useMemo(() => text.length > maxChar
		? <>{text.substring(0, 200)}<span className="color-fg">{'\u2026'}{text.length}</span></>
		: text
		, [text]
	)

	return (
		<div className={`${cls.root} ${error ? cls.error : ""}`} style={style}>
			{render}
		</div>
	)
}

export default TextRow
