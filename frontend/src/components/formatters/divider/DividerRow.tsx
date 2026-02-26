import CloseIcon from "@/icons/CloseIcon"
import { IconButton, TooltipWrapCmp } from "@priolo/jack"
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
	onDelete?: () => void
	variant?: DIVIDER_VARIANT

	style?: React.CSSProperties,
	className?: string
}

const DividerRow: FunctionComponent<Props> = ({
	title,
	children,
	time,
	onClick,
	onDelete,
	variant = DIVIDER_VARIANT.BORDER_UP,

	style,
	className,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleDeleteClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		onDelete?.()
	}

	// RENDER
	const clsSelected = !!onClick ? cls.selected : ""
	const clsRoot = `${cls.root} ${clsSelected} ${className} jack-hover-container`

	return <div
		className={clsRoot}
		style={style}
		onClick={onClick}
	>
		{(variant == DIVIDER_VARIANT.BORDER_UP || variant == DIVIDER_VARIANT.BORDER_BOTH) && (
			<div className="jack-bars-alert-bg" style={{ height: 10 }} />
		)}
		<div className={cls.title} style={{ display: 'flex', alignItems: 'center' }}>
			<span style={{ flex: 1 }}>{title}</span>
			{onDelete && (
				<TooltipWrapCmp content="REMOVE">
					<IconButton className="jack-hover-hide" onClick={handleDeleteClick}>
						<CloseIcon style={{ width: 12, height: 12 }} />
					</IconButton>
				</TooltipWrapCmp>
			)}
		</div>
		<div className={cls.body}>{children}</div>
		<div className={cls.footer}>{time}</div>
		{(variant == DIVIDER_VARIANT.BORDER_DOWN || variant == DIVIDER_VARIANT.BORDER_BOTH) && (
			<div className="jack-bars-alert-bg" style={{ height: 10 }} />
		)}
	</div>
}

export default DividerRow
