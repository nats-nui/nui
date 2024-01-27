import FrameworkCard from "@/components/FrameworkCard"
import Button from "@/components/buttons/Button"
import RowButton from "@/components/buttons/RowButton"
import DatabaseIcon from "@/icons/DatabaseIcon"
import MessagesIcon from "@/icons/MessagesIcon"
import SettingsIcon from "@/icons/SettingsIcon"
import cnnSo from "@/stores/connections"
import docSo from "@/stores/docs"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { DOC_TYPE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import ConnectionDetailForm from "./DetailForm"
import ActionsCmp from "./ActionsCmp"



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

	// HANDLER
	const handleMessagesClick = () => cnnDetailSo.openMessages()
	const handleStreamsClick = () => cnnDetailSo.openStreams()
	// const handleCreateClick = async () => {
	// 	cnnDetailSo.setReadOnly(true)
	// 	const cnnNew = await cnnSo.save(cnnDetailSa.connection);
	// 	(cnnDetailSa.parent as CnnListStore).select(cnnNew)
	// }
	const handleEditClick = async () => cnnDetailSo.setReadOnly(false)
	const handleCancelClick = () => {
		cnnDetailSo.setReadOnly(true)
		cnnDetailSo.restore()
	}
	const handleSaveClick = async () => {
		cnnDetailSo.setReadOnly(true)
		await cnnSo.save(cnnDetailSa.connection)
	}

	// RENDER
	const isMessageOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.MESSAGES
	const isStreamsOpen = cnnDetailSa.linked?.state.type == DOC_TYPE.STREAMS
	const isNew = cnnDetailSa.connection?.id == null
	const readOnly = cnnDetailSa.readOnly
	const variant = cnnDetailSa.colorVar

	return <FrameworkCard
		store={cnnDetailSo}
		variantBg={variant}
		actionsRender={<ActionsCmp store={cnnDetailSo}/>}

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

		<ConnectionDetailForm
			cnnDetailSo={cnnDetailSo}
		/>

	</FrameworkCard>
}

export default CnnDetailView
