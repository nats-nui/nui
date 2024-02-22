import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/stores/docs/types"
import { buildStore } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import { LoadSession, SaveSession } from "@/utils/startup"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Button from "../buttons/Button"
import IconRow from "../rows/IconRow"
import StoreIcon from "./StoreIcon"



interface Props {
	style?: React.CSSProperties
}

const MainMenu: FunctionComponent<Props> = ({
	style,
}) => {

	// STORE
	const docSa = useStore(docSo)

	// HOOKS

	// HANDLERS
	const handleConnectionsClick = () => {
		// se c'e' gia' una singletone-card allora setto solo il fuoco
		if (!!docSo.find({ type: DOC_TYPE.CONNECTIONS })) return
		const view = buildStore({ type: DOC_TYPE.CONNECTIONS })
		docSo.add({ view, anim: true })
	}
	const handleLogsClick = () => {
		let view = docSo.find({ type: DOC_TYPE.LOGS })
		if (!!view) {
			docSo.remove({ view, anim: true })
		} else {
			view = buildStore({ type: DOC_TYPE.LOGS })
			docSo.add({ view, anim: true })
		}
	}

	// RENDER
	const views = docSa.menu

	return <div style={{ ...cssContainer, ...style }}>
		<IconRow onClick={handleConnectionsClick}
			title="CONNECTIONS"
			variant={COLOR_VAR.GREEN}
			selected
		/>
		{views.map((view) => (
			<StoreIcon key={view.state.uuid} store={view} />
		))}
		<div style={{ flex: 1 }} />
		<Button label="SAVE" onClick={() => SaveSession()} />
		<Button label="LOAD" onClick={() => LoadSession()} />
		<IconRow onClick={handleLogsClick}
			title="LOGS"
			variant={COLOR_VAR.CYAN}
			selected
		/>
	</div>
}

export default MainMenu

const cssContainer: React.CSSProperties = {
	display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
	backgroundColor: "#494949",
	padding: "10px",
}