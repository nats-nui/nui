import FrameworkCard from "@/components/cards/FrameworkCard"
import { AboutStore } from "@/stores/stacks/about"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import logoSrc from "@/assets/Logo.svg"
import cls from "./View.module.css"



interface Props {
	store?: AboutStore
	style?: React.CSSProperties,
}

const AboutView: FunctionComponent<Props> = ({
	store: aboutSo,
	style,
}) => {

	// STORE
	const aboutSa = useStore(aboutSo)

	// HOOKs

	// HANDLER

	// RENDER
	return <FrameworkCard
		store={aboutSo}
	>
		<div className={cls.root} />
	</FrameworkCard>
}

export default AboutView

