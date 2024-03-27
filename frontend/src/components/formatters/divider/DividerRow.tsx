import { FunctionComponent } from "react"
import cls from "./DividerRow.module.css"


export enum DIVIDER_VARIANT {
	BORDER_UP,
	BORDER_DOWN,
	BORDER_BOTH,
}


interface Props {
	icon?: React.ReactNode
	title?: React.ReactNode
	children?: React.ReactNode
	time?: string
	onClick?: () => void
	variant?: DIVIDER_VARIANT
	colorVar?: number
}

const DividerRow: FunctionComponent<Props> = ({
	title,
	children,
	time,
	onClick,
	variant = DIVIDER_VARIANT.BORDER_UP,
	colorVar,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	return <div className={`color-bg ${cls.root}`}
		style={{
			backgroundColor: !!colorVar ? `var(--var-${colorVar})` : null,
			cursor: !onClick ? null : "pointer",
		}}
		onClick={onClick}
	>
		{(variant == DIVIDER_VARIANT.BORDER_UP || variant == DIVIDER_VARIANT.BORDER_BOTH) && (
			<div className="bars-alert-bg" style={{ height: 10 }} />
		)}
		<div className={cls.title}>{title}</div>
		<div className={cls.body}>{children}</div>
		<div className={cls.footer}>{time}</div>
		{(variant == DIVIDER_VARIANT.BORDER_DOWN || variant == DIVIDER_VARIANT.BORDER_BOTH) && (
			<div className="bars-alert-bg" style={{ height: 10 }} />
		)}
	</div>
}

export default DividerRow
