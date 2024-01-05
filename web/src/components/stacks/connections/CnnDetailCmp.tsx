import Label from "@/components/input/Label"
import TextInput from "@/components/input/TextInput"
import EditAuthRow from "@/components/rows/EditAuthRow"
import EditList from "@/components/lists/EditList"
import EditStringRow from "@/components/rows/EditStringRow"
import EditSubscriptionRow from "@/components/rows/EditSubscriptionRow"
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
		cnnDetailSo.setConnection({ ...cnnDetailSa.connection, name })
	}
	const handleHostsChange = (hosts: string[]) => {
		cnnDetailSo.setConnection({ ...cnnDetailSa.connection, hosts })
	}
	const handleAuthsChange = (auth: Auth[]) => {
		cnnDetailSo.setConnection({ ...cnnDetailSa.connection, auth })
	}
	const handleSubscriptionsChange = (subscriptions: Subscription[]) => {
		cnnDetailSo.setConnection({ ...cnnDetailSa.connection, subscriptions })
	}

	// RENDER
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
			RenderRow={(props) => EditSubscriptionRow({...props, noDisable: true})}
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