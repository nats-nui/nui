import FrameworkCard from "@/components/cards/FrameworkCard"
import YouTubeIcon from "@/icons/YouTubeIcon"
import { HelpStore } from "@/stores/stacks/help"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import cls from "./View.module.css"
import clsCard from "../CardWhiteDef.module.css"
import HelpIcon from "../../../icons/HelpIcon"



interface Props {
	store?: HelpStore
	style?: React.CSSProperties,
}

const HelpView: FunctionComponent<Props> = ({
	store: helpSo,
	style,
}) => {

	// STORE
	const helpSa = useStore(helpSo)

	// HOOKs

	// HANDLER

	// RENDER
	return <FrameworkCard
		icon={<HelpIcon />}
		className={clsCard.root}
		store={helpSo}
	>
		<div className={cls.root}>

			<YTRow
				title="PLAY WITH CARDS"
				url="https://www.youtube.com/embed/gw7HiFVPkew?si=Io8nCr2reLb7qT9o"
			/>

			<YTRow
				title="READ AND SEND MESSAGES FROM A CONNECTION"
				url="https://www.youtube.com/embed/he6amIWaCfo?si=Io8nCr2reLb7qT9o"
			/>

			<YTRow
				title="VIEW MESSAGES FROM A STREAM"
				url="https://www.youtube.com/embed/kEJsUWAWGhs?si=Io8nCr2reLb7qT9o"
			/>

		</div>
	</FrameworkCard>
}

export default HelpView

interface YTRowProps {
	title: string
	url: string
}

const YTRow: FunctionComponent<YTRowProps> = ({
	title,
	url,
}) => {

	const handleUpdateClick = () => window.open(url)

	const src = `${url}?controls=0`

	return <div className={cls.row}>
		<div className={cls.labelRow}
			onClick={handleUpdateClick}
		>
			<YouTubeIcon className={cls.icon} />
			<div className={cls.label}>{title}</div>
		</div>
		{/* <iframe
			style={{ width: "100%" }}
			src={src}
			title={title}
			frameBorder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerPolicy="strict-origin-when-cross-origin"
			allowFullScreen
		></iframe> */}
	</div>
}