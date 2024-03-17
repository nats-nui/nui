import IconToggle from "@/components/buttons/IconToggle"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import Form from "@/components/format/Form"
import TextInput from "@/components/input/TextInput"
import EditList from "@/components/lists/EditList"
import ListObjects from "@/components/lists/ListObjects"
import EditStringRow from "@/components/rows/EditStringRow"
import { EditSubscriptionNoDisableRow } from "@/components/rows/EditSubscriptionRow"
import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Auth, EDIT_STATE, Subscription } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import AuthForm from "./AuthForm"



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

	return <Form>

		<div className="lbl-prop-title">BASE</div>
		<BoxV>
			<div className="lbl-prop">NAME</div>
			<TextInput
				value={name}
				onChange={handleChangeName}
				readOnly={inRead}
			/>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">HOST</div>
			<EditList<string>
				items={hosts}
				onItemsChange={handleHostsChange}
				placeholder="ex. demo.nats.io"
				onNewItem={() => ""}
				RenderRow={EditStringRow}
				readOnly={inRead}
				fnIsVoid={h => !h || h.trim().length == 0}
			/>
		</BoxV>

		<div className="lbl-prop-title">ADVANCED</div>
		<BoxV>
			<div className="lbl-prop">FAVORITE SUBJECT</div>
			<EditList<Subscription>
				items={subscriptions}
				onItemsChange={handleSubscriptionsChange}
				onNewItem={() => ({ subject: "" })}
				RenderRow={EditSubscriptionNoDisableRow}
				placeholder="ex. house1.room4.*"
				readOnly={inRead}
				fnIsVoid={c => !c.subject || c.subject.trim().length == 0}
			/>
		</BoxV>

		<BoxV>
			<div className="lbl-prop">AUTH</div>
			<ListObjects<Auth>
				store={cnnDetailSo}
				items={auths}
				readOnly={inRead}
				RenderLabel={({ item: auth, index }) => (
					<Box>
						<IconToggle
							check={auth.active}
							onChange={(check, e) => handleActivate(check, index, e)}
							readOnly={inRead}
							trueIcon={<CheckRadioOnIcon />}
						/>
						{auth?.mode}
					</Box>
				)}
				onDelete={handleAuthDelete}
				RenderForm={({ item, index, onClose }) => (
					<AuthForm
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
