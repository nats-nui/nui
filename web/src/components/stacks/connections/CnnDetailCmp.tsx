import Divider from "@/components/format/Divider"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import EditAuthRow from "@/components/rows/EditAuthRow"
import EditStringRow from "@/components/rows/EditStringRow"
import { EditSubscriptionNoDisableRow } from "@/components/rows/EditSubscriptionRow"
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
	const variant = cnnDetailSo.getColorVar()

	return <div style={cssForm}>

		<Label>NAME</Label>
		<TextInput
			value={name}
			onChange={handleChangeName}
			readOnly={readOnly}
		/>

		<Label>HOST</Label>
		<EditList<string>
			items={hosts}
			onChangeItems={handleHostsChange}
			fnNewItem={() => "<new>"}
			RenderRow={EditStringRow}
			readOnly={readOnly}
			variant={variant}
		/>

		<Divider style={{marginBottom: 5}} label="ADVANCED"/>

		<Label>SUBSCRIPTIONS</Label>
		<EditList<Subscription>
			items={subscriptions}
			onChangeItems={handleSubscriptionsChange}
			fnNewItem={() => ({ subject: "<new>" })}
			RenderRow={EditSubscriptionNoDisableRow}
			readOnly={readOnly}
			variant={variant}
		/>

		<Label>AUTH</Label>
		<EditList<Auth>
			items={auths}
			onChangeItems={handleAuthsChange}
			RenderRow={EditAuthRow}
			readOnly={readOnly}
			variant={variant}
		/>

	</div>
}

export default CnnDetailCmp

const cssForm: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
}
