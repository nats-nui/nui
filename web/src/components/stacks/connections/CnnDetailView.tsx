import Header from "@/components/Header"
import ActionGroup from "@/components/buttons/ActionGroup"
import Button from "@/components/buttons/Button"
import RowButton from "@/components/buttons/RowButton"
import DatabaseIcon from "@/icons/DatabaseIcon"
import MessagesIcon from "@/icons/MessagesIcon"
import SettingsIcon from "@/icons/SettingsIcon"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import layoutSo from "@/stores/layout"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CnnListStore } from "@/stores/stacks/connection/list"
import { DOC_TYPE } from "@/types"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent, useEffect } from "react"
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
	const cnnSa = useStore(cnnSo)

	// HOOKs
	useEffect(() => {
		let cnn = cnnDetailSo.getConnection()
		if (cnn == null) cnn = {
			name: "",
			hosts: [],
			subscriptions: [],
			auth: []
		}
		cnnDetailSo.setInEdit(cnn)
	}, [cnnSa.all])

	// HANDLER
	const handleClickMessages = () => {
		cnnDetailSo.openMessages()
	}
	const handleClickNew = async () => {
		const cnnNew = await cnnSo.create(cnnDetailSa.inEdit);
		(cnnDetailSa.parent as CnnListStore).select(cnnNew)
	}

	// RENDER
	const isMessageOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.MESSAGES
	const isNew = cnnDetailSa.inEdit?.id == null

	return <div style={{ ...cssContainer, ...style }}>

		<Header view={cnnDetailSo} />

		{isNew && (
			<ActionGroup style={{ marginLeft: -8 }}>
				<Button colorVar={0}
					label="CREATE"
					onClick={handleClickNew}
				/>
			</ActionGroup>
		)}

		{!isNew && <>
			<RowButton style={cssItem}
				icon={<MessagesIcon />}
				label="MESSAGES"
				select={isMessageOpen}
				onClick={handleClickMessages}
			/>
			<RowButton style={cssItem}
				icon={<DatabaseIcon />}
				label="DATABASES"
			/>
			<RowButton style={cssItem}
				icon={<SettingsIcon />}
				label="SETTINGS"
			/>
		</>}

		<CnnDetailCmp style={{ marginTop: 25 }}
			cnnDetailSo={cnnDetailSo}
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
