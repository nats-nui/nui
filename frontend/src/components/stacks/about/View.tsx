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
		window.open("https://natsnui.app/downloads/")
	}

	// RENDER
	const current = aboutSa.about?.currentVersion ?? "--"
	const latest = aboutSa.about?.latestVersion ?? "--"
	return <FrameworkCard
		store={aboutSo}
	>
		<div className={cls.logo} />

		<div className="lyt-form">

			<div className="lyt-v">
				<div className="lbl-prop">CURRENT</div>
				<div className="lbl-input-readonly">{current}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">LAST</div>
				<div className="lbl-input-readonly">{latest}</div>
			</div>

			{aboutSa.about?.shouldUpdate && <>
				<div className={cls.divider} />
				<Button className={cls.btt}
					onClick={handleUpdate}
				>UPDATE</Button>
			</>}

		</div>

	</FrameworkCard>
}

export default AboutView

