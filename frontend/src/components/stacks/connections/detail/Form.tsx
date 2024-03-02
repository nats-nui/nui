import BoxV from "@/components/format/BoxV"
import Divider from "@/components/format/Divider"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import ListDialog from "@/components/lists/ListDialog"
import EditStringRow from "@/components/rows/EditStringRow"
import { EditSubscriptionNoDisableRow } from "@/components/rows/EditSubscriptionRow"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Auth, EDIT_STATE, Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useState } from "react"
import EditAuthRow from "./EditAuthRow"
import Box from "@/components/format/Box"
import IconToggle from "@/components/buttons/IconToggle"



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
	const [authSelect, setAuthSelect] = useState(-1)

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



	const handleAuthChange = (auth: Auth, index: number) => {
		if (!auth) return
		const cnnAuth = cnnDetailSa.connection.auth
		if (index == -1) cnnAuth.push(auth); else cnnAuth[index] = auth
		cnnDetailSo.setConnection({ ...cnnDetailSa.connection })
	}
	const handleAuthDelete = (index: number) => {
		if (index < 0) return
		cnnDetailSa.connection.auth.splice(index, 1)
		cnnDetailSo.setConnection({ ...cnnDetailSa.connection })
	}
	const handleActivate = (check: boolean, indexSel: number, e: React.MouseEvent) => {
		e.stopPropagation()
		cnnDetailSa.connection.auth.forEach((auth, index) => auth.active = check && index == indexSel)
		cnnDetailSo.setConnection({ ...cnnDetailSa.connection })
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
				onNewItem={() => "<new>"}
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
				onNewItem={() => ({ subject: "<new>" })}
				RenderRow={EditSubscriptionNoDisableRow}
				readOnly={inRead}
				variant={variant}
			/>
		</BoxV>

		<BoxV>
			<Label>AUTH</Label>
			<ListDialog<Auth>
				store={cnnDetailSo}
				items={auths}
				readOnly={inRead}
				RenderLabel={({ item: auth, index }) => (
					<Box>
						<IconToggle
							check={auth.active}
							onChange={(check, e) => handleActivate(check, index, e)}
							readOnly={inRead}
						/>
						{auth?.mode}
					</Box>
				)}
				onDelete={handleAuthDelete}
				RenderForm={({ item, index, onClose }) => (
					<EditAuthRow
						auth={item}
						readOnly={inRead}
						onClose={(auth) => { onClose(); handleAuthChange(auth, index) }}
					/>
				)}
			/>
		</BoxV>

	</Form>
}

export default ConnectionDetailForm
