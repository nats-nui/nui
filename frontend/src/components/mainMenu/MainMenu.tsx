import docSo from "@/stores/docs"
import { DOC_TYPE } from "@/stores/docs/types"
import { buildStore } from "@/stores/docs/utils/factory"
import { COLOR_VAR } from "@/stores/layout"
import { StartSession, EndSession } from "@/utils/startup"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import Button from "../buttons/Button"
import MenuButton from "../buttons/MenuButton"
import StoreButton from "./StoreButton"



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
		<MenuButton onClick={handleConnectionsClick}
			title="CONNECTIONS"
			selected
		/>
		{views.map((view) => (
			<StoreButton key={view.state.uuid} store={view} />
		))}
		<div style={{ flex: 1 }} />


		{/* *** DEBUG *** */}
		{process.env.NODE_ENV === 'development' && <>
			<Button children="SAVE" onClick={() => EndSession()} />
			<Button children="LOAD" onClick={() => StartSession()} />
		</>}
		{/* *** DEBUG *** */}


		<MenuButton onClick={handleLogsClick}
			title="LOGS"
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