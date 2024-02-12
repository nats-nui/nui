import layoutSo from "@/stores/layout"
import { FunctionComponent, useState } from "react"



interface Props {
	style?: React.CSSProperties
	preRender?: React.ReactNode
	enterRender?: React.ReactNode
	children?: React.ReactNode
	selected?: boolean
	readOnly?: boolean
	onClick?: (e: React.MouseEvent) => void
}

const Component: FunctionComponent<Props> = ({
	style,
	preRender,
	enterRender,
	children,
	selected,
	readOnly,
	onClick,
}) => {
	// STORE

	// HOOK
	const [enter, setEnter] = useState(false)

	// HANDLER
	const handleEnter = () => setEnter(true)
	const handleLeave = () => setEnter(false)

	// RENDER
	const isCliccable = !!onClick

	return (
		<div
			style={{ ...cssRoot(isCliccable, selected, readOnly), ...style }}
			onMouseEnter={enterRender ? handleEnter : null}
			onMouseLeave={enterRender ? handleLeave : null}
			onClick={onClick}
		>
			{preRender}
			{children}
			{enter && <div style={{ position: "absolute", top: 4, right: 4 }}>
				{enterRender}
			</div>}
		</div>
	)
}

export default Component



const cssText: React.CSSProperties = {
	flex: 1,
	alignItems: "center",
	position: "relative",
	display: "flex",
	borderRadius: 3,
	fontSize: 12,
	fontWeight: 600,
	padding: "4px 3px",
	minHeight: 14,
	gap: 5,
}

const cssRoot = (isCliccable: boolean, selected: boolean, readOnly: boolean): React.CSSProperties => ({
	...cssText,
	backgroundColor: selected ? "#00000020" : readOnly ? null : '#00000010',
	cursor: isCliccable ? "pointer" : null,
})