import React, { FunctionComponent, useMemo } from "react"
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
	const isTruncate = maxChar && text.length > maxChar
	const base64 = useMemo(() => {
		if (!text) return null
		return btoa(isTruncate ? text.slice(0, maxChar) : text)
	}, [text, maxChar])
	if (!base64) return null

	return (
		<div className={cls.root} style={style}>
			{base64}
			{isTruncate && <>
				<span style={cssSelect}>
					{'\u2026'}
					{text.length}
				</span>
			</>}
		</div>
	)
}

export default Base64Cmp

const cssSelect: React.CSSProperties = {
	color: "var(--cmp-select-bg)"
}