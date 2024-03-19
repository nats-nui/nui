import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import CloseIcon from "@/icons/CloseIcon"
import layoutSo from "@/stores/layout"
import React, { FunctionComponent, useState } from "react"
import classes from "./MenuButton.module.css"



interface Props {
	selected?: boolean
	title: string
	subtitle?: string
	children?: React.ReactNode
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
	selected,
	children,
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

	return (
		<div className={className}>
			<TooltipWrapCmp className={classes.root}
				content={<div>
					<div style={{ fontWeight: 700 }}>{title}</div>
					<div>{subtitle}</div>
				</div>}
				onMouseOver={enter => setEnter(enter)}
			>
				{showCloseBtt && <div className={classes.cancel}
					onClick={onClose}
				><CloseIcon /></div>}

				<div onClick={onClick}>
					{children}
				</div>
			</TooltipWrapCmp>

			<div>{subtitle}</div>
		</div>
	)
}

export default MenuButton
