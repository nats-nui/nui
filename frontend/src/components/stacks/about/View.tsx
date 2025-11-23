import FrameworkCard from "@/components/cards/FrameworkCard"
import GitHubIcon from "@/icons/GitHubIcon"
import HelpIcon from "@/icons/HelpIcon"
import BigEyeIcon from "@/icons/BigEyeIcon"
import { AboutStore } from "@/stores/stacks/about"
import { Button } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import KeyboardIcon from "../../../icons/KeyboardIcon"
import clsCard from "../CardWhiteDef.module.css"
import cls from "./View.module.css"
import ThemeDialog from "./ThemeDialog"



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
	const handleShortcutClick = () => aboutSo.openShortcut()
	const handleThemeClick = () => aboutSo.setThemeOpen(true)

	// RENDER
	const current = aboutSa.about?.currentVersion ?? "--"
	const latest = aboutSa.about?.latestVersion ?? "--"
	return <FrameworkCard
		className={clsCard.root}
		icon={<div style={{ fontSize: 16, fontWeight: 700 }}>?</div>}
		store={aboutSo}
	>
		<div className={cls.logo} />

		<div className="jack-lyt-form">

			<div className={cls.linkContainer}>
				<div className={`${cls.link} jack-focus-1`}
					onClick={handleGitHubClick}
				><GitHubIcon style={{ width: 20, height: 20, margin: "0px 2px" }} />GitHub</div>

				<div className={`${cls.link} jack-focus-2`}
					onClick={handleShortcutClick}
				><KeyboardIcon style={{ width: 24, height: 24 }} />Shortcut</div>

				<div className={`${cls.link} jack-focus-3`}
					onClick={handleHelpClick}
				><HelpIcon style={{ width: 24, height: 24 }} />Help</div>

				<div className={`${cls.link} jack-focus-4`}
					onClick={handleThemeClick}
				><BigEyeIcon style={{ width: 24, height: 24 }} />Theme</div>

			</div>

			<div className={cls.divider} />

			<div className="lyt-v">
				<div className="jack-lbl-prop">CURRENT</div>
				<div className="jack-lbl-readonly">{current}</div>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">LAST</div>
				<div className="jack-lbl-readonly">{latest}</div>
			</div>

			{aboutSa.about?.shouldUpdate && <>

				<Button className={`${cls.btt} jack-focus-5`}
					onClick={handleUpdateClick}
				>UPDATE</Button>
			</>}

		</div>

		<ThemeDialog store={aboutSo} />

	</FrameworkCard>
}

export default AboutView

