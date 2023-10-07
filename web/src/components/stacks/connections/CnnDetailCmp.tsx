import { Connection } from "@/types"
import { FunctionComponent } from "react"



interface Props {
	connection: Connection
	onChangeConnection?: (connection:Connection)=>void
}

/**
 * dettaglio di una CONNECTION
 */
const CnnDetailCmp: FunctionComponent<Props> = ({
	connection,
	onChangeConnection,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value
		const cnn = { ...connection, name }
		onChangeConnection(cnn)
	}
	const handleClickSubs = () => {
		// docsSo.addLink({
		// 	view: initView({
		// 		type: DOC_TYPE.LIST,
		// 		items: ["primo", "secondo", "terzo"]
		// 	} as ViewState),
		// 	parent: cnnSo
		// })



		//parentSo.setDialogCmp(!!parentSo.state.dialogCmp ? null : subscrsDlg)
	}


	// RENDER
	//const connection = cnnSo.getById(viewSo.getSelectId())
	if (!connection) return null

	// const subscrsDlg = <SubscriptionsDlg
	// 	store={viewSo}
	// 	parentSo={parentSo}
	// />

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

export default CnnDetailCmp
