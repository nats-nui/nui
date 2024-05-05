import FrameworkCard from "@/components/cards/FrameworkCard"
import { AboutStore } from "@/stores/stacks/about"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import cls from "./View.module.css"
import Button from "@/components/buttons/Button"
import GitHubIcon from "@/icons/GitHubIcon"
import HelpIcon from "@/icons/HelpIcon"



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
	const handleUpdateClick = () => window.open("https://natsnui.app/downloads/")
	const handleGitHubClick = () => window.open("https://github.com/nats-nui/nui")
	const handleHelpClick = () => window.open("https://natsnui.app/help/")

	// RENDER
	const current = aboutSa.about?.currentVersion ?? "--"
	const latest = aboutSa.about?.latestVersion ?? "--"
	return <FrameworkCard
		store={aboutSo}
	>
		<div className={cls.logo} />

		<div className="lyt-form">

			<div className={cls.linkContainer}>
				<div className={cls.link}
					onClick={handleGitHubClick}
				><GitHubIcon />GitHub</div>

				<div className={cls.link}
					onClick={handleHelpClick}
				><HelpIcon style={{ width: 16, height: 16 }} />Help</div>
			</div>

			<div className={cls.divider} />

			<div className="lyt-v">
				<div className="lbl-prop">CURRENT</div>
				<div className="lbl-readonly">{current}</div>
			</div>

			<div className="lyt-v">
				<div className="lbl-prop">LAST</div>
				<div className="lbl-readonly">{latest}</div>
			</div>

			{aboutSa.about?.shouldUpdate && <>
				<div className={cls.divider} />
				<Button className={cls.btt}
					onClick={handleUpdateClick}
				>UPDATE</Button>
			</>}

		</div>

	</FrameworkCard>
}

export default AboutView

