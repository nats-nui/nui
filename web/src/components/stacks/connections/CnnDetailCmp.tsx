import Label from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import cnnSo from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import SubscriptionsList from "../../lists/sunscriptions/SubscriptionsList"
import layoutSo from "@/stores/layout"
import EditList from "@/components/lists/generic/EditList"
import EditStringRow from "@/components/lists/generic/EditStringRow"



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

	// HANDLER
	const handleChangeName = (name: string) => {
		const cnn = { ...cnnDetailSa.connection, name }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleHostsChange = (hosts: string[]) => {
		const cnn = { ...cnnDetailSa.connection, hosts }
		cnnDetailSo.setConnection(cnn)
		//if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleSubscriptionsChange = (subscriptions: Subscription[]) => {
		const newConnection = { ...cnnDetailSa.connection, subscriptions }
		cnnDetailSo.setConnection(newConnection)
		cnnSo.modify(newConnection)
	}

	// RENDER
	const isNew = cnnDetailSa.connection?.id == null
	if (cnnDetailSa.connection == null) return null
	const name = cnnDetailSa.connection.name ?? ""
	const hosts = cnnDetailSa.connection.hosts ?? []
	const subscriptions = cnnDetailSa.connection.subscriptions ?? []

	return <div style={{ ...cssForm, ...style }}>

		<Label>NAME</Label>
		<TextInput
			value={name}
			onChange={handleChangeName}
		/>

		<Label>HOST</Label>
		<EditList<string>
			style={cssList}
			items={hosts}
			onChangeItems={handleHostsChange}
			fnNewItem={()=>"<new>"}
			RenderRow={EditStringRow}
		/>

		<Label>SUBSCRIPTIONS</Label>
		<SubscriptionsList noDisable
			style={cssList}
			subscriptions={subscriptions}
			onChange={handleSubscriptionsChange}
		/>

		<Label>AUTH PATH</Label>
		{/* <TextInput
			value={host}
			onChange={handleChangeHost}
		/> */}

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