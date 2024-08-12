import CloseIcon from "@/icons/CloseIcon"
import React, { FunctionComponent, useState } from "react"
import cls from "./MenuButton.module.css"
import { TooltipWrapCmp } from "@priolo/jack"



interface Props {
	title: string
	subtitle?: string
	children?: React.ReactNode
	badge?: React.ReactNode
	style?: React.CSSProperties
	className?: string
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
	onClose?: (e: React.MouseEvent<HTMLDivElement>) => void
}

/**
 * Lo STACK di una collezione di CONNECTIONs
 */
const MenuButton: FunctionComponent<Props> = ({
	title,
	subtitle,
	children,
	badge,
	style,
	className,
	onClick,
	onClose,
}) => {

	// STORE
	const [enter, setEnter] = useState(false)

	// HOOKs

	// HANDLER

	// RENDER
	const showCloseBtt = enter && !!onClose
	const clsRoot = `${className ?? ""} ${cls.root}`
	return (
		<div
			style={style}
			className={clsRoot}
			onClick={onClick}
		>
			<TooltipWrapCmp className={cls.box}
				content={
					<div className={cls.tooltip}>
						<div className={cls.title}>{title}</div>
						<div className={cls.sub}>{subtitle}</div>
					</div>
				}
				onMouseOver={enter => setEnter(enter)}
			>
				{/* BADGE BUTTON CANCEL */}
				{showCloseBtt && <div className={`${cls.badge} ${cls.cancel}`}
					onClick={onClose}
				><CloseIcon /></div>}

				{/* BADGE */}
				{badge && <div className={cls.badge}
					onClick={onClose}
				>{badge}</div>}

				<div>
					{children}
				</div>
			</TooltipWrapCmp>

			<div className={cls.label}>
				{subtitle}
			</div>
		</div>
	)
}

export default MenuButton
