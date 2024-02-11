import BoxV from "@/components/format/BoxV"
import Divider from "@/components/format/Divider"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import EditAuthRow from "@/components/rows/EditAuthRow"
import EditStringRow from "@/components/rows/EditStringRow"
import { EditSubscriptionNoDisableRow } from "@/components/rows/EditSubscriptionRow"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Auth, EDIT_STATE, Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	cnnDetailSo: CnnDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const ConnectionDetailForm: FunctionComponent<Props> = ({
	cnnDetailSo,
}) => {

	// STORE
	const cnnDetailSa = useStore(cnnDetailSo)

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
	const inRead = cnnDetailSa.editState == EDIT_STATE.READ
	const variant = cnnDetailSa.colorVar

	return <Form>

		<BoxV>
			<Label>NAME</Label>
			<TextInput
				value={name}
				onChange={handleChangeName}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<Label>HOST</Label>
			<EditList<string>
				items={hosts}
				onChangeItems={handleHostsChange}
				fnNewItem={() => "<new>"}
				RenderRow={EditStringRow}
				readOnly={inRead}
				variant={variant}
			/>
		</BoxV>

		<Divider style={{ marginBottom: 5 }} label="ADVANCED" />

		<BoxV>
			<Label>SUBSCRIPTIONS</Label>
			<EditList<Subscription>
				items={subscriptions}
				onChangeItems={handleSubscriptionsChange}
				fnNewItem={() => ({ subject: "<new>" })}
				RenderRow={EditSubscriptionNoDisableRow}
				readOnly={inRead}
				variant={variant}
			/>
		</BoxV>

		<BoxV>
			<Label>AUTH</Label>
			<EditList<Auth>
				items={auths}
				onChangeItems={handleAuthsChange}
				RenderRow={EditAuthRow}
				readOnly={inRead}
				variant={variant}
			/>
		</BoxV>

	</Form>
}

export default ConnectionDetailForm
