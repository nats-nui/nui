import ListDialog from "@/components/lists/ListDialog"
import BoxV from "@/components/format/BoxV"
import Divider from "@/components/format/Divider"
import Form from "@/components/format/Form"
import Label from "@/components/format/Label"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import EditStringRow from "@/components/rows/EditStringRow"
import { EditSubscriptionNoDisableRow } from "@/components/rows/EditSubscriptionRow"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { AUTH_MODE, Auth, EDIT_STATE, Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import Box from "@/components/format/Box"
import IconToggle from "@/components/buttons/IconToggle"
import Options from "@/components/Options"



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
			<ListDialog<Auth>
				store={cnnDetailSo}
				items={auths}
				renderLabel={(item) => item?.mode}
				renderForm={(item) => <>
					<Options<string>
						value={item?.mode}
						items={Object.values(AUTH_MODE)}
						RenderRow={({ item }) => item}
					//readOnly={readOnly}
					//height={100}
					//onSelect={(mode)=>item.mode=mode}
					/>
					<BoxV>
						<Label>USERNAME</Label>
						<TextInput
							value={""}
							//onChange={handleSequenceChange}
							// variant={variant}
							//readOnly={readOnly}
						/>
					</BoxV>
					<BoxV>
						<Label>PASSWORD</Label>
						<TextInput
							value={""}
							//onChange={handleSequenceChange}
							// variant={variant}
							//readOnly={readOnly}
						/>
					</BoxV>
				</>}
			/>
			{/* <EditList<Auth>
				items={auths}
				onChangeItems={handleAuthsChange}
				RenderRow={({item})=>item.mode}
				readOnly={inRead}
				variant={variant}
			/>*/}
		</BoxV>

	</Form>
}

export default ConnectionDetailForm
