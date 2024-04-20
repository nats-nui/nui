import React, { FunctionComponent } from "react"
import cls from "./ElementRow.module.css"



interface Props {
	selected?: boolean
	title: string
	icon?: React.ReactNode
	subtitle?: string
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
	testRender?: React.ReactNode
}

/**
 * riga generica di lista figa
 */
const ElementRow: FunctionComponent<Props> = ({
	title,
	subtitle,
	icon,
	selected,
	onClick,
	testRender,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER
	if (!title) return null
	const clsRoot = `${cls.root} ${selected ? "color-bg color-text" : ""}`

	return <div className={clsRoot}
		onClick={onClick}
	>
		{icon}
		<div className={cls.label}>
			<div className="lbl-rowelement-title">
				{title}
			</div>
			<div className="lbl-rowelement-subtitle" style={{ display: "flex" }}>
				<div>{subtitle}</div>
				{testRender}
			</div>
		</div>
	</div>
}

export default ElementRow
