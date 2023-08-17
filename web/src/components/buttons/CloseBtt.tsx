import docSo, { DRAG_ZONE, DocState } from "@/stores/docs"
import { DOC_TYPE, DocView, POSITION_TYPE } from "@/types/Doc"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import img from "@/assets/cnn-hdr2.svg"
import imgClose from "@/assets/close.svg"


interface Props {
	onClick?: (e:React.MouseEvent) => void
}

const CloseBtt: FunctionComponent<Props> = ({
	onClick,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER

	return (
		<div style={cssContainer}
			onClick={onClick}
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path id="Vector 1" d="M1 1L9 9M1 9L9 1" stroke="white"/>
			</svg>
		</div>
	)
}

export default CloseBtt

const cssContainer: React.CSSProperties = {
}
