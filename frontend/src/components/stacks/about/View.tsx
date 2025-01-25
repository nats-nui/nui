import FrameworkCard from "@/components/cards/FrameworkCard"
import GitHubIcon from "@/icons/GitHubIcon"
import HelpIcon from "@/icons/HelpIcon"
import { AboutStore } from "@/stores/stacks/about"
import { Button, TitleAccordion } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
import clsCard from "../CardWhiteDef.module.css"
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
		className={clsCard.root}
		icon={<div style={{ fontSize: 16, fontWeight: 700 }}>?</div>}
		store={aboutSo}
	>
		<div className={cls.logo} />

		<div className="jack-lyt-form">

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
				<div className="jack-lbl-prop">CURRENT</div>
				<div className="jack-lbl-readonly">{current}</div>
			</div>

			<div className="lyt-v">
				<div className="jack-lbl-prop">LAST</div>
				<div className="jack-lbl-readonly">{latest}</div>
			</div>

			{aboutSa.about?.shouldUpdate && <>

				<Button className={cls.btt}
					onClick={handleUpdateClick}
				>UPDATE</Button>
			</>}

			<div className={cls.divider} />

			<div className={cls.title}>
				SHORTCUT
			</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>→</div>
			</div>
			<div className={cls.description}>sposta il fuoco a destra</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>←</div>
			</div>
			<div className={cls.description}>sposta il fuoco a sinistra</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>↓</div>
			</div>
			<div className={cls.description}>fuoco al component in basso</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>↑</div>
			</div>
			<div className={cls.description}>fuoco al component in alto</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={`${cls.kbr}`}>Z</div>
			</div>
			<div className={cls.description}>sposta il FOCUS al prossimo DECK (ce ne sono due a rotazione: MAIN e DRAWER</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>CTRL</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>→</div>
			</div>
			<div className={cls.description}>sposta la CARD a destra:</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>CTRL</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>←</div>
			</div>
			<div className={cls.description}>sposta la CARD a sinistra </div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>CTRL</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>↑</div>
			</div>
			<div className={cls.description}>ingrandire la CARD / ZEN MODE: </div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>CTRL</div>
				+
				<div className={`${cls.kbr} ${cls.single}`}>↓</div>
			</div>
			<div className={cls.description}>rimpicciolire la CARD:</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>BACKSPACE</div>
			</div>
			<div className={cls.description}>chiudere la CARD:</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>D</div>
			</div>
			<div className={cls.description}>detach dlla CARD:</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>F</div>
			</div>
			<div className={cls.description}>fuoco sulla "text find" della CARD (se c'e'): </div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>X</div>
			</div>
			<div className={cls.description}>sposta la CARD nel DECK DRAWER se si trova nel DECK MAIN e viceversa</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>C</div>
			</div>
			<div className={cls.description}>apre o da il FOCUS alla CARD CONNECTIONS</div>

			<div className={cls.shortcut}>
				<div className={cls.kbr}>ALT</div>
				+
				<div className={cls.kbr}>1-9</div>
			</div>
			<div className={cls.description}>simulazione click sul bottone della CARD</div>


		</div>

	</FrameworkCard>
}

export default AboutView

