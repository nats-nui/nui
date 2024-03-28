import React, { FunctionComponent } from "react"
import cls from "./Base64Cmp.module.css"



interface Props {
	text?: string
	maxChar?: number
	style?: React.CSSProperties
}

const Base64Cmp: FunctionComponent<Props> = ({
	text,
	maxChar,
	style,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!text) return null
	const isTruncate = maxChar && text.length > maxChar
	const base64 = btoa(isTruncate ? text.slice(0, maxChar) : text)

	return (
		<div className={cls.root} style={style}>
			{base64}
			{isTruncate && <>
				<span className="color-fg">
					{'\u2026'}
					{text.length}
				</span>
			</>}
		</div>
	)
}

export default Base64Cmp
