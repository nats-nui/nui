import Options from "@/components/Options"
import BoxV from "@/components/format/BoxV"
import Label from "@/components/format/Label"
import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent, useEffect, useState } from "react"
import TextInput from "../../../input/TextInput"
import Button from "@/components/buttons/Button"
import Form from "@/components/format/Form"



interface Props {
	auth: Auth
	readOnly?: boolean,
	onClose?: (auth: Auth) => void
}

const AuthForm: FunctionComponent<Props> = ({
	auth,
	readOnly,
	onClose,
}) => {

	// HOOKS
	const [authEdit, setAuthEdit] = useState<Auth>(auth)
	useEffect(() => {
		setAuthEdit(auth ?? {
			mode: AUTH_MODE.TOKEN, creds: "", jwt: "", nkey: "", password: "", token: "", username: ""
		})
	}, [auth])

	// HANDLER
	const handlePropChange = (prop: Partial<Auth>) => setAuthEdit({ ...authEdit, ...prop })

	// RENDER
	if (!authEdit) return null
	return <Form>
		<Options<string>
			value={authEdit?.mode}
			items={Object.values(AUTH_MODE)}
			RenderRow={({ item }) => item}
			readOnly={readOnly}
			//height={100}
			onSelect={(mode) => handlePropChange({ mode: mode as AUTH_MODE })}
		/>
		{{
			[AUTH_MODE.USER_PASSWORD]: <>
				<BoxV><div className="lbl-prop">USERNAME</div><TextInput
					value={authEdit.username}
					onChange={username => handlePropChange({ username })}
					readOnly={readOnly}
				/></BoxV>
				<BoxV><div className="lbl-prop">PASSWORD</div><TextInput
					value={authEdit.password}
					onChange={password => handlePropChange({ password })}
					readOnly={readOnly}
				/></BoxV>
			</>,
			[AUTH_MODE.TOKEN]: (
				<BoxV><div className="lbl-prop">TOKEN</div><TextInput
					value={authEdit.token}
					onChange={token => handlePropChange({ token })}
					readOnly={readOnly}
				/></BoxV>
			),
			[AUTH_MODE.JWT]: <>
				<BoxV><div className="lbl-prop">JWT</div><TextInput
					value={authEdit.jwt}
					onChange={jwt => handlePropChange({ jwt })}
					readOnly={readOnly}
				/></BoxV>
				<BoxV><div className="lbl-prop">NKEY</div><TextInput
					value={authEdit.nkey}
					onChange={nkey => handlePropChange({ nkey })}
					readOnly={readOnly}
				/></BoxV>
			</>,
			[AUTH_MODE.CREDS_FILE]: <>
				<BoxV><div className="lbl-prop">CREDS PATH FILE</div><TextInput
					value={authEdit.creds}
					onChange={creds => handlePropChange({ creds })}
					readOnly={readOnly}
				/></BoxV>
			</>,
		}[authEdit.mode]}
		
		<div style={{ display: "flex", gap: 5, justifyContent: 'flex-end', }}>
			<Button children="CANCEL"
				onClick={() => onClose(null)}
			/>
			{!readOnly && (
				<Button children="SAVE"
					onClick={() => onClose(authEdit)}
				/>
			)}
		</div>
		</Form>
	
}

export default AuthForm

const cssRow: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
}
