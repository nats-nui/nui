import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Auth, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import AuthForm from "./AuthForm"
import { EditList, EditStringRow, IconToggle, ListObjects, TextInput, TitleAccordion } from "@priolo/jack"



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
	const connection = cnnDetailSo.getConnection()
	if (connection == null) return null
	const name = connection.name ?? ""
	const hosts = connection.hosts ?? []
	const auths = connection.auth ?? []
	const inRead = cnnDetailSa.editState == EDIT_STATE.READ

	return <div className="jack-lyt-form var-dialog">

		<TitleAccordion title="BASE">
			<div className="lyt-v">
				<div className="jack-lbl-prop">NAME</div>
				<TextInput autoFocus
					value={name}
					onChange={handleChangeName}
					readOnly={inRead}
				/>
			</div>
			<div className="lyt-v">
				<div className="jack-lbl-prop">HOST</div>
				<EditList<string>
					items={hosts}
					onItemsChange={handleHostsChange}
					readOnly={inRead}
					placeholder="ex. demo.nats.io"

					onNewItem={() => ""}
					fnIsVoid={h => !h || h.trim().length == 0}
					RenderRow={EditStringRow}
				/>
			</div>
		</TitleAccordion>


		<TitleAccordion title="ADVANCED">
			<div className="lyt-v">
				<div className="jack-lbl-prop">AUTH</div>
				<ListObjects<Auth>
					store={cnnDetailSo}
					items={auths}
					readOnly={inRead}
					width={170}
					RenderLabel={({ item: auth, index }) => (
						<div className="jack-cmp-h">
							<IconToggle
								check={auth.active}
								onChange={(check, e) => handleActivate(check, index, e)}
								readOnly={inRead}
								trueIcon={<CheckRadioOnIcon />}
							/>
							{auth?.mode?.toUpperCase()}
						</div>
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
			</div>
		</TitleAccordion>

	</div>
}

export default ConnectionDetailForm
