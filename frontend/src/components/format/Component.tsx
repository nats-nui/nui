import { FunctionComponent } from "react"
import cls from "./Component.module.css"



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

	// HANDLER

	// RENDER
	const isCliccable = !!onClick
	const clsRoot = `hover-container ${cls.root} ${isCliccable ? "cliccable" : ""} ${selected ? cls.selected : ""} ${readOnly ? cls.readonly : ""}`

	return (
		<div className={clsRoot}
			style={style}
			onClick={onClick}
		>
			{preRender}
			{children}
			<div className="hover-hide hover-show" style={{ position: "absolute", top: 4, right: 4 }}>
				{enterRender}
			</div>
		</div>
	)
}

export default Component
