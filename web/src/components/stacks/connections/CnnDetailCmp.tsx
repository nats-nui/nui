import SubDetail from "@/components/subscription/Detail"
import SubRow from "@/components/subscription/Row"
import cnnSo from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import Dialog from "../dialogs/Dialog"
import ListEditDlg from "../dialogs/ListEditDlg"



interface Props {
	cnnDetailSo: CnnDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const CnnDetailCmp: FunctionComponent<Props> = ({
	cnnDetailSo,
}) => {

	// STORE
	const cnnDetailSa = useStore(cnnDetailSo) as CnnDetailState

	// HOOKs
	// const refDialog = useMemo(() => {
	// 	if (!cnnDetailSa.dialogOpen) return null
	// 	const elm = document.getElementById(`dialog_${cnnDetailSa.uuid}`)
	// 	return elm
	// }, [cnnDetailSa.dialogOpen])


	// HANDLER
	const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value
		const cnn = { ...cnnDetailSa.connection, name }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleChangeHost = (e: React.ChangeEvent<HTMLInputElement>) => {
		const host = e.target.value
		const cnn = { ...cnnDetailSa.connection, host }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleClickSubs = () => {
		cnnDetailSo.setDialogOpen(true)
	}
	const handleCloseDetail = () => {
		cnnDetailSo.setDialogOpen(false)
	}
	const handleCreate = async () => {
		const cnn = await cnnSo.create(cnnDetailSa.connection)
		cnnDetailSo.setConnection(cnn)
	}

	const handleChangeSubs = (newItems: Subscription[]) => {
		cnnDetailSa.connection.subscriptions = newItems
		cnnDetailSo.setConnection({ ...cnnDetailSa.connection })
	}

	// RENDER
	// const subscrsDlg = <SubscriptionsDlg
	// 	parentSo={parentSo}
	// 	onClose={() => parentSo.setDialogCmp(null)}
	// />

	const isNew = cnnDetailSa.connection?.id == null

	if (cnnDetailSa.connection == null) return null

	return (<div>

		<div>NAME</div>
		<input
			value={cnnDetailSa.connection.name}
			onChange={handleChangeName}
		/>

		<div>HOST</div>
		<input
			value={cnnDetailSa.connection.host}
			onChange={handleChangeHost}
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

		<Dialog store={cnnDetailSo}>
			<ListEditDlg<Subscription>
				items={cnnDetailSa.connection.subscriptions}
				RenderRow={SubRow}
				RenderDetail={SubDetail}
				fnNewItem={() => ({ subject: "<new>" })}
				onChange={handleChangeSubs}
				onClose={handleCloseDetail}
			/>
		</Dialog>

	</div>)
}

export default CnnDetailCmp
