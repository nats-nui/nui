import TooltipWrapCmp from "@/components/tooltip/TooltipWrapCmp"
import CloseIcon from "@/icons/CloseIcon"
import React, { FunctionComponent, useState } from "react"
import cls from "./MenuButton.module.css"



interface Props {
	title: string
	subtitle?: string
	children?: React.ReactNode
	badge?: React.ReactNode
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
		<div className={clsRoot}>
			<TooltipWrapCmp className={cls.box}
				content={<div>
					<div className={cls.tooltip_title}>{title}</div>
					<div className={cls.tooltip_sub}>{subtitle}</div>
				</div>}
				onMouseOver={enter => setEnter(enter)}
			>
				{/* BADGE BUTTON CANCEL */}
				{showCloseBtt && <div className={`${cls.badge} ${cls.cancel}`}
					onClick={onClose}
				><CloseIcon /></div>}

				{/* BADGE */}
				{badge && <div className={`color-bg color-text ${cls.badge}`}
					onClick={onClose}
				>{badge}</div>}

				<div onClick={onClick}>
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
