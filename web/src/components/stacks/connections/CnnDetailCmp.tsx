import Label from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import EditAuthRow from "@/components/lists/generic/EditAuthRow"
import EditList from "@/components/lists/generic/EditList"
import EditStringRow from "@/components/lists/generic/EditStringRow"
import EditSubscriptionRow from "@/components/lists/generic/EditSubscriptionRow"
import cnnSo from "@/stores/connections"
import layoutSo from "@/stores/layout"
import { CnnDetailState, CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Auth, Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



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
		const cnn = { ...cnnDetailSa.connection, name }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleHostsChange = (hosts: string[]) => {
		const cnn = { ...cnnDetailSa.connection, hosts }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleAuthsChange = (auth: Auth[]) => {
		const cnn = { ...cnnDetailSa.connection, auth }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
	}
	const handleSubscriptionsChange = (subscriptions: Subscription[]) => {
		const cnn = { ...cnnDetailSa.connection, subscriptions }
		cnnDetailSo.setConnection(cnn)
		if (!isNew) cnnSo.updateConnection(cnn)
		//cnnSo.modify(cnn)
	}

	// RENDER
	const isNew = cnnDetailSa.connection?.id == null
	if (cnnDetailSa.connection == null) return null
	const name = cnnDetailSa.connection.name ?? ""
	const hosts = cnnDetailSa.connection.hosts ?? []
	const subscriptions = cnnDetailSa.connection.subscriptions ?? []
	const auths = cnnDetailSa.connection.auth ?? []
	const readOnly = cnnDetailSa.readOnly

	return <div style={cssForm}>

		<Label>NAME</Label>
		<TextInput
			value={name}
			onChange={handleChangeName}
			readOnly={readOnly}
		/>

		<Label>HOST</Label>
		<EditList<string>
			style={cssList(readOnly)}
			items={hosts}
			onChangeItems={handleHostsChange}
			fnNewItem={() => "<new>"}
			RenderRow={EditStringRow}
			readOnly={readOnly}
		/>

		<Label>SUBSCRIPTIONS</Label>
		<EditList<Subscription>
			style={cssList(readOnly)}
			items={subscriptions}
			onChangeItems={handleSubscriptionsChange}
			fnNewItem={() => ({ subject: "<new>" })}
			RenderRow={EditSubscriptionRow}
			readOnly={readOnly}
		/>

		<Label>AUTH</Label>
		<EditList<Auth>
			style={cssList(readOnly)}
			items={auths}
			onChangeItems={handleAuthsChange}
			RenderRow={EditAuthRow}
			readOnly={readOnly}
		/>

	</div>
}

export default CnnDetailCmp

const cssForm: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}

const cssList = (readOnly: boolean): React.CSSProperties => ({
	backgroundColor: readOnly ? null : layoutSo.state.theme.palette.default.bg,
	color: readOnly ? null : layoutSo.state.theme.palette.default.fg,
})