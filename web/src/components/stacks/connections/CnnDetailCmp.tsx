import cnnSo from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import SubscriptionsDlg from "./SubscriptionsDlg"



interface Props {
	parentSo: CnnDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const CnnDetailCmp: FunctionComponent<Props> = ({
	parentSo,
}) => {

	// STORE
	const cnnDetailSa = useStore(parentSo) as CnnDetailState

	// HOOKs

	// HANDLER
	const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value
		const cnn = { ...cnnDetailSa.connection, name }
		parentSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleClickSubs = () => {
		parentSo.setDialogCmp(subscrsDlg)
	}
	const handleCreate = async () => {
		const cnn = await cnnSo.create(cnnDetailSa.connection)
		parentSo.setConnection(cnn)
	}

	// RENDER
	const subscrsDlg = <SubscriptionsDlg
		parentSo={parentSo}
		onClose={() => parentSo.setDialogCmp(null)}
	/>

	const isNew = cnnDetailSa.connection?.id == null

	if (cnnDetailSa.connection == null) return null

	return (<div>

		<div>NAME</div>
		<input
			value={cnnDetailSa.connection.name}
			onChange={handleChangeName}
		/>

		<div>SUBSCRIPTIONS</div>
		<button
			onClick={handleClickSubs}
		>{cnnDetailSa.connection.subscriptions?.map(s => s.subject).join(",")}</button>

		{isNew &&
			<button
				onClick={handleCreate}
			>CREATE</button>
		}
	</div>)
}

export default CnnDetailCmp
