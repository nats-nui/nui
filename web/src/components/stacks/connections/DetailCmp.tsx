import { ConnectionState, ConnectionStore } from "@/stores/connection"
import { ViewStore } from "@/stores/docs/docBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import SubscriptionsDialog from "./SubscriptionsDialog"



interface Props {
	store?: ConnectionStore
	parentSo?: ViewStore
}

const DetailCmp: FunctionComponent<Props> = ({
	store: cnnSo,
	parentSo,
}) => {

	// STORE
	const cnnSa = useStore(cnnSo) as ConnectionState
	if (!parentSo) parentSo = cnnSo

	// HOOKs

	// HANDLER
	const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value
		const cnn = { ...connection, name }
		cnnSo.updateSelected(cnn)
	}
	const handleClickSubs = () => {
		// docsSo.addLink({
		// 	view: initView({
		// 		type: DOC_TYPE.LIST,
		// 		items: ["primo", "secondo", "terzo"]
		// 	} as ViewState),
		// 	parent: cnnSo
		// })
		parentSo.setDialogCmp(!!parentSo.state.dialogCmp ? null : subscrsDlg)
	}


	// RENDER
	const connection = cnnSo.getSelect()
	if (!connection) return null

	const subscrsDlg = <SubscriptionsDialog
		store={cnnSo}
		parentSo={parentSo}
	/>

	return (<div>

		<div>NAME</div>
		<input
			value={connection.name}
			onChange={handleChangeName}
		/>

		<div>SUBSCRIPTIONS</div>
		<button
			onClick={handleClickSubs}
		>{connection.subscriptions.map(s => s.subject).join(",")}</button>

	</div>)
}

export default DetailCmp
