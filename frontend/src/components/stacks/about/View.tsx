import FrameworkCard from "@/components/cards/FrameworkCard"
import { AboutStore } from "@/stores/stacks/about"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import cls from "./View.module.css"
import Button from "@/components/buttons/Button"



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
	useEffect(() => {
		aboutSo.fetchIfVoid()
	}, [])

	// HANDLER
	const handleUpdate = (e) => {
		console.log("UPDATE")
	}

	// RENDER
	const current = aboutSa.about?.currentVersion ?? "--"
	const latest = aboutSa.about?.latestVersion ?? "--"
	return <FrameworkCard
		store={aboutSo}
	>
		<div className={cls.logo} />

		<div>CURRENT</div>
		<div>{current}</div>
		<div>LAST</div>
		<div>{latest}</div>

		<Button
			onClick={handleUpdate}
		>UPDATE</Button>

	</FrameworkCard>
}

export default AboutView

