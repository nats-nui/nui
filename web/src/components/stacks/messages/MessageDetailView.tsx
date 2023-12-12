import Header from "@/components/Header"
import RowButton from "@/components/buttons/RowButton"
import DatabaseIcon from "@/icons/DatabaseIcon"
import MessagesIcon from "@/icons/MessagesIcon"
import SettingsIcon from "@/icons/SettingsIcon"
import connSo from "@/stores/connections"
import docSo from "@/stores/docs"
import layoutSo from "@/stores/layout"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"



interface Props {
	store?: CnnDetailStore
	style?: React.CSSProperties,
}

const CnnDetailView: FunctionComponent<Props> = ({
	store: cnnDetailSo,
	style,
}) => {

	// STORE
	useStore(docSo)
	const cnnDetailSa = useStore(cnnDetailSo)
	useStore(connSo)

	// HOOKs

	// HANDLER

	// RENDER
	return <div style={{ ...cssContainer, ...style }}>

		<Header view={cnnDetailSo}
			style={{ color: layoutSo.state.theme.palette.var[0].fg }}
		/>

		<RowButton style={cssItem}
			icon={<MessagesIcon />}
			label="MESSAGES"
			//select={isMessageOpen}
			//onClick={handleClickMessages}
		/>
		<RowButton style={cssItem}
			icon={<DatabaseIcon />}
			label="DATABASES"
		//select={isMessageOpen}
		//onClick={handleClickMessages}
		/>
		<RowButton style={cssItem}
			icon={<SettingsIcon />}
			label="SETTINGS"
		//select={isMessageOpen}
		//onClick={handleClickMessages}
		/>


	</div>
}

export default CnnDetailView

const cssContainer: React.CSSProperties = {
	paddingLeft: "15px",
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: layoutSo.state.theme.palette.var[0].bg,
	color: layoutSo.state.theme.palette.var[0].fg,
	//width: "146px",
}

const cssItem: React.CSSProperties = {
}
