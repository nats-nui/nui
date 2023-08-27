import cnnSo, { ConnectionState } from "@/stores/connections"
import { ViewStore } from "@/stores/docs/docBase"
import { CnnViewState, CnnViewStore } from "@/stores/stacks/connection"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import SubscriptionsDlg from "./SubscriptionsDlg"



interface Props {
	store?: CnnViewStore
	parentSo?: ViewStore
}

const DetailCmp: FunctionComponent<Props> = ({
	store: viewSo,
	parentSo,
}) => {

	// STORE
	const viewSa = useStore(viewSo) as CnnViewState
	const cnnSa = useStore(cnnSo) as ConnectionState
	if (!parentSo) parentSo = viewSo

	// HOOKs

	// HANDLER
	const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value
		const cnn = { ...connection, name }
		cnnSo.updateConnection(cnn)
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
	const connection = cnnSo.getById(viewSo.getSelectId())
	if (!connection) return null

	const subscrsDlg = <SubscriptionsDlg
		store={viewSo}
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
