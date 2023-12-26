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
	const variant = cnnDetailSo.getColorBg()

	return <FrameworkCard
		store={cnnDetailSo}
		actionsRender={isNew && (
			<Button
				label="CREATE"
				variant={variant}
				onClick={handleClickNew}
			/>
		)}
	>
		{!isNew && <div style={{ marginBottom: 20 }}>
			<RowButton
				icon={<MessagesIcon />}
				label="MESSAGES"
				variant={variant}
				select={isMessageOpen}
				onClick={handleClickMessages}
			/>
			<RowButton
				icon={<DatabaseIcon />}
				variant={variant}
				label="DATABASES"
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
