import React, { FunctionComponent } from "react"
import layoutSo from "@/stores/layout"



interface Props {
	text?: string
	maxChar?: number
}

const Base64Cmp: FunctionComponent<Props> = ({
	text,
	maxChar,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!text) return null
	const isTruncate = maxChar && text.length > maxChar
	const base64 = btoa(isTruncate ? text.slice(0, maxChar) : text )

	return (
		<div style={cssBody}>
			{base64}
			{isTruncate && <>
				{'\u2026'}
				<span style={cssInfo}>
					{text.length}
				</span>
			</>}
		</div>
	)
}

export default Base64Cmp

const cssBody: React.CSSProperties = {
	fontFamily: "monospace",
	fontSize: 14,
	overflowWrap: "break-word",
	wordBreak: "break-all",
}

const cssInfo: React.CSSProperties = {
	color: layoutSo.state.theme.palette.default.fg2,
}