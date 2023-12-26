import Label from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import cnnSo from "@/stores/connections"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Auth, Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import SubscriptionsList from "../../lists/sunscriptions/SubscriptionsList"
import layoutSo from "@/stores/layout"
import EditList from "@/components/lists/generic/EditList"
import EditStringRow from "@/components/lists/generic/EditStringRow"
import EditAuthRow from "@/components/lists/generic/EditAuthRow"



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

	// HANDLER
	const handleChangeName = (name: string) => {
		const cnn = { ...cnnDetailSa.inEdit, name }
		cnnDetailSo.setInEdit(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleHostsChange = (hosts: string[]) => {
		const cnn = { ...cnnDetailSa.inEdit, hosts }
		cnnDetailSo.setInEdit(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleAuthsChange = (auth: Auth[]) => {
		const cnn = { ...cnnDetailSa.inEdit, auth }
		cnnDetailSo.setInEdit(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleSubscriptionsChange = (subscriptions: Subscription[]) => {
		const cnn = { ...cnnDetailSa.inEdit, subscriptions }
		cnnDetailSo.setInEdit(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
		//cnnSo.modify(cnn)
	}

	// RENDER
	const isNew = cnnDetailSa.inEdit?.id == null
	if (cnnDetailSa.inEdit == null) return null
	const name = cnnDetailSa.inEdit.name ?? ""
	const hosts = cnnDetailSa.inEdit.hosts ?? []
	const subscriptions = cnnDetailSa.inEdit.subscriptions ?? []
	const auths = cnnDetailSa.inEdit.auth ?? []

	return <div style={cssForm}>

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
			fnNewItem={() => "<new>"}
			RenderRow={EditStringRow}
		/>

		<Label>SUBSCRIPTIONS</Label>
		<SubscriptionsList noDisable
			style={cssList}
			subscriptions={subscriptions}
			onChange={handleSubscriptionsChange}
		/>

		<Label>AUTH</Label>
		<EditList<Auth>
			style={cssList}
			items={auths}
			onChangeItems={handleAuthsChange}
			RenderRow={EditAuthRow}
		/>

	</div>
}

export default CnnDetailCmp

const cssForm: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}

const cssList: React.CSSProperties = {
	backgroundColor: layoutSo.state.theme.palette.default.bg,
	color: layoutSo.state.theme.palette.default.fg,
}