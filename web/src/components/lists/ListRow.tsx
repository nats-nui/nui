import { useState } from "react"



interface Props<T> {
	children?: React.ReactNode
	style?: React.CSSProperties
	readOnly?: boolean
	onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

function ListRow<T>({
	children,
	style,
	readOnly,
	onClick
}: Props<T>) {

	// STORES

	// HOOKS

	// HANDLERS

	// RENDER
	return <div
		style={{ ...cssRoot(readOnly), ...style }}
		className={!readOnly ? "cliccable" : null}
		onClick={!readOnly ? onClick : null}
	>
		{children}
	</div>
}

export default ListRow

const cssRoot = (readOnly: boolean): React.CSSProperties => ({
	display: "flex",
	padding: 3,
	fontSize: 12,
	fontWeight: 600,
	borderRadius: 3,
	cursor: !readOnly ? "pointer" : null,
})