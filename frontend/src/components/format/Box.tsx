import { FunctionComponent } from "react"
import cls from "./Box.module.css"



interface Props {
	className?: string
	style?: React.CSSProperties
	preRender?: React.ReactNode
	enterRender?: React.ReactNode
	readOnly?: boolean
	children?: React.ReactNode
}

const Box: FunctionComponent<Props> = ({
	className,
	style,
	preRender,
	enterRender,
	readOnly,
	children,
}) => {
	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return (
		<div className={`hover-container ${cls.root} ${className}`}
			style={style}
		>
			{preRender}
			{children}
			{!readOnly && <div className={`hover-show ${cls.enter}`}>
				{enterRender}
			</div>}
		</div>
	)
}

export default Box


