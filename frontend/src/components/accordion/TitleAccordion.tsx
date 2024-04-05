import React, { FunctionComponent, useState } from "react"
import Accordion from "./Accordion"
import ArrowDownIcon from "@/icons/ArrowDownIcon"
import ArrowUpIcon from "@/icons/ArrowUpIcon"
import cls from "./Accordion.module.css"



interface Props {
	title?: string
	children?: React.ReactNode
}

const TitleAccordion: FunctionComponent<Props> = ({
	title,
	children,
}) => {

	// STORE

	// HOOK
	const [open, setOpen] = useState(true)

	// HANDLER
	const handleClick = () => setOpen(!open)

	// RENDER
	return <div className={cls.root_title}>

		<div className={`lbl-prop-title ${cls.title}`}
			style={{ alignItems: "center", display: "flex", justifyContent: "center", cursor: "pointer" }}
			onClick={handleClick}
		>
			{title}
			{open ? <ArrowDownIcon /> : <ArrowUpIcon />}
		</div>

		<Accordion open={open}>
			{children}
		</Accordion>

	</div>
}

export default TitleAccordion
