import Header from "@/components/Heder"
import connSo, { ConnectionState } from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import CnnDetailCmp from "./CnnDetailCmp"
import layoutSo from "@/stores/layout"
import RowButton from "@/components/buttons/RowButton"
import MessagesIcon from "@/icons/MessagesIcon"
import { DOC_TYPE } from "@/types"
import docSo, { DocState } from "@/stores/docs"
import DatabaseIcon from "@/icons/DatabaseIcon"
import SettingsIcon from "@/icons/SettingsIcon"



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
	const handleClickMessages = () => {
		cnnDetailSo.openMessages()
	}

	// RENDER
	const isMessageOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.MESSAGES

	return <div style={{ ...cssContainer, ...style }}>

		<Header view={cnnDetailSo} 
			title="DETAIL" 
			style={{color: layoutSo.state.theme.palette.fg.acid[0]}}
		/>

		<RowButton style={cssItem}
			icon={<MessagesIcon />}
			label="MESSAGES"
			select={isMessageOpen}
			onClick={handleClickMessages}
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
		
		<hr />

		<CnnDetailCmp
			cnnDetailSo={cnnDetailSo}
		/>
	</div>
}

export default CnnDetailView

const cssContainer: React.CSSProperties = {
	paddingLeft: "15px",
	flex: 1,
	display: "flex", flexDirection: "column",
	backgroundColor: "#BBFB35",
	color: "black",
	//width: "146px",
}

const cssItem: React.CSSProperties = {
}
