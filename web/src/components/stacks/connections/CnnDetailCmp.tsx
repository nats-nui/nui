import Label from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import cnnSo from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import SubscriptionsList from "../../lists/sunscriptions/SubscriptionsList"
import layoutSo from "@/stores/layout"



interface Props {
	cnnDetailSo: CnnDetailStore
	style?: React.CSSProperties
}

/**
 * dettaglio di una CONNECTION
 */
const CnnDetailCmp: FunctionComponent<Props> = ({
	cnnDetailSo,
	style,
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
	const handleChangeName = (name: string) => {
		const cnn = { ...cnnDetailSa.connection, name }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleChangeHost = (host: string) => {
		const cnn = { ...cnnDetailSa.connection, hosts: [host] }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	// const handleClickSubs = () => {
	// 	cnnDetailSo.setSubOpen(true)
	// }
	// const handleCloseDetail = () => {
	// 	cnnDetailSo.setSubOpen(false)
	// }
	// const handleCreate = async () => {
	// 	const cnn = await cnnSo.create(cnnDetailSa.connection)
	// 	cnnDetailSo.setConnection(cnn)
	// }
	const handleSubscriptionsChange = (subscriptions: Subscription[]) => {
		const newConnection = { ...cnnDetailSa.connection, subscriptions }
		cnnDetailSo.setConnection(newConnection)
		cnnSo.modify(newConnection)
	}

	// const handleChangeSubs = (newItems: Subscription[]) => {
	// 	cnnDetailSa.connection.subscriptions = newItems
	// 	const newConnection = { ...cnnDetailSa.connection }
	// 	cnnDetailSo.setConnection(newConnection)
	// 	cnnSo.modify(newConnection)
	// }

	// RENDER
	// const subscrsDlg = <SubscriptionsDlg
	// 	parentSo={parentSo}
	// 	onClose={() => parentSo.setDialogCmp(null)}
	// />

	const isNew = cnnDetailSa.connection?.id == null

	if (cnnDetailSa.connection == null) return null

	const name = cnnDetailSa.connection.name ?? ""
	const host = cnnDetailSa.connection.hosts?.[0] ?? ""
	const subscriptions = cnnDetailSa.connection.subscriptions ?? []

	return <div style={{ ...cssForm, ...style }}>

		<Label>NAME</Label>
		<TextInput
			value={name}
			onChange={handleChangeName}
		/>

		<Label>HOST</Label>
		<TextInput
			value={host}
			onChange={handleChangeHost}
		/>

		<Label>SUBSCRIPTIONS</Label>
		<SubscriptionsList noDisable
			style={cssList}
			subscriptions={subscriptions}
			onChange={handleSubscriptionsChange}
		/>
	</div>
}

export default CnnDetailCmp

const cssForm:React.CSSProperties = {
	display: "flex", 
	flexDirection: "column",
	paddingRight: 8,
}

const cssList:React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
}