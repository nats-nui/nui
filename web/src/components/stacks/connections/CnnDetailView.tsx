import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import RowButton from "@/components/buttons/RowButton"
import DatabaseIcon from "@/icons/DatabaseIcon"
import MessagesIcon from "@/icons/MessagesIcon"
import SettingsIcon from "@/icons/SettingsIcon"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { CnnListStore } from "@/stores/stacks/connection/list"
import { DOC_TYPE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import CnnDetailCmp from "./CnnDetailCmp"



interface Props {
	store?: CnnDetailStore
}

const CnnDetailView: FunctionComponent<Props> = ({
	store: cnnDetailSo,
}) => {

	// STORE
	useStore(docSo)
	const cnnDetailSa = useStore(cnnDetailSo)
	const cnnSa = useStore(cnnSo)

	// HOOKs
	useEffect(() => {
		let cnn = cnnDetailSa.connection
		if (cnn == null) cnn = {
			name: "",
			hosts: [],
			subscriptions: [],
			auth: []
		}
		cnnDetailSo.setConnection(cnn)
	}, [cnnSa.all])

	// HANDLER
	const handleMessagesClick = () => cnnDetailSo.openMessages()
	const handleStreamsClick = () => cnnDetailSo.openStreams()
	const handleCreateClick = async () => {
		const cnnNew = await cnnSo.create(cnnDetailSa.connection);
		(cnnDetailSa.parent as CnnListStore).select(cnnNew)
	}
	const handleEditClick = async () => cnnDetailSo.setReadOnly(false)
	const handleCancelClick = () => cnnDetailSo.setReadOnly(true)
	const handleSaveClick = () => cnnDetailSo.setReadOnly(true)

	// RENDER
	const isMessageOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.MESSAGES
	const isStreamsOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.STREAMS
	const isNew = cnnDetailSa.connection?.id == null
	const readOnly = cnnDetailSa.readOnly
	const variant = cnnDetailSo.getColorBg()

	return <FrameworkCard
		store={cnnDetailSo}
		actionsRender={isNew ? (
			<Button
				label="CREATE"
				variant={variant}
				onClick={handleCreateClick}
			/>
		) : readOnly ? (
			<Button
				label="EDIT"
				variant={variant}
				onClick={handleEditClick}
			/>
		) : (<>
			<Button
				label="SAVE"
				variant={variant}
				onClick={handleSaveClick}
			/>
			<Button
				label="CANCEL"
				variant={variant}
				onClick={handleCancelClick}
			/>
		</>)}

	>
		{!isNew && <div style={{ marginBottom: 20 }}>
			<RowButton
				icon={<MessagesIcon />}
				label="MESSAGES"
				variant={variant}
				select={isMessageOpen}
				onClick={handleMessagesClick}
			/>
			<RowButton
				icon={<DatabaseIcon />}
				label="STREAMS"
				variant={variant}
				select={isStreamsOpen}
				onClick={handleStreamsClick}
			/>
			<RowButton
				icon={<SettingsIcon />}
				variant={variant}
				label="SETTINGS"
			/>
		</div>}

		<CnnDetailCmp
			cnnDetailSo={cnnDetailSo}
		/>

	</FrameworkCard>
}

export default CnnDetailView
