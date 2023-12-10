import Header from "@/components/Heder"
import ActionGroup from "@/components/buttons/ActionGroup"
import Button from "@/components/buttons/Button"
import RowButton from "@/components/buttons/RowButton"
import DatabaseIcon from "@/icons/DatabaseIcon"
import MessagesIcon from "@/icons/MessagesIcon"
import SettingsIcon from "@/icons/SettingsIcon"
import connSo from "@/stores/connections"
import docSo from "@/stores/docs"
import layoutSo from "@/stores/layout"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CnnListStore } from "@/stores/stacks/connection/list"
import { DOC_TYPE } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import CnnDetailCmp from "./CnnDetailCmp"



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
	const handleClickNew = async () => {
		const cnnNew = await connSo.create(cnnDetailSa.connection);
		(cnnDetailSa.parent as CnnListStore).select(cnnNew)
	}

	// RENDER
	const isMessageOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.MESSAGES
	const isNew = cnnDetailSa.connection?.id == null

	return <div style={{ ...cssContainer, ...style }}>

		<Header view={cnnDetailSo}
			title="DETAIL"
			style={{ color: layoutSo.state.theme.palette.fg.acid[0] }}
		/>

		{isNew && <ActionGroup style={{ marginLeft: -8}}>
			<Button colorVar={0}
				label="CREATE"
				onClick={handleClickNew}
			/>
		</ActionGroup>}

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
	backgroundColor: layoutSo.state.theme.palette.bg.acid[0],
	color: layoutSo.state.theme.palette.fg.acid[0],
	//width: "146px",
}

const cssItem: React.CSSProperties = {
}
