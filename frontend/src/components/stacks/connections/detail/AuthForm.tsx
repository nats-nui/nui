import Options from "@/components/Options"
import Button from "@/components/buttons/Button"
import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import TextInput from "../../../input/TextInput"
import StringUpRow from "@/components/rows/StringUpRow"



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
	const authItems = useMemo(() => Object.values(AUTH_MODE).map(a => a/*.toUpperCase()*/), [AUTH_MODE])

	// RENDER
	if (!authEdit) return null
	return <div className="lyt-form var-dialog">
		<Options<string>
			value={authEdit?.mode?.toUpperCase()}
			items={authItems}
			RenderRow={StringUpRow}
			readOnly={readOnly}
			//height={100}
			onSelect={(mode) => handlePropChange({ mode: mode as AUTH_MODE })}
		/>
		{{
			[AUTH_MODE.USER_PASSWORD]: <>
				<div className="lyt-v"><div className="lbl-prop">USERNAME</div><TextInput
					value={authEdit.username}
					onChange={username => handlePropChange({ username })}
					readOnly={readOnly}
				/></div>
				<div className="lyt-v"><div className="lbl-prop">PASSWORD</div><TextInput
					value={authEdit.password}
					onChange={password => handlePropChange({ password })}
					readOnly={readOnly}
				/></div>
			</>,
			[AUTH_MODE.TOKEN]: (
				<div className="lyt-v"><div className="lbl-prop">TOKEN</div><TextInput
					value={authEdit.token}
					onChange={token => handlePropChange({ token })}
					readOnly={readOnly}
				/></div>
			),
			[AUTH_MODE.JWT]: <>
				<div className="lyt-v"><div className="lbl-prop">JWT</div><TextInput
					value={authEdit.jwt}
					onChange={jwt => handlePropChange({ jwt })}
					readOnly={readOnly}
				/></div>
				<div className="lyt-v"><div className="lbl-prop">NKEY</div><TextInput
					value={authEdit.nkey}
					onChange={nkey => handlePropChange({ nkey })}
					readOnly={readOnly}
				/></div>
			</>,
			[AUTH_MODE.CREDS_FILE]: <>
				<div className="lyt-v"><div className="lbl-prop">CREDS PATH FILE</div><TextInput
					value={authEdit.creds}
					onChange={creds => handlePropChange({ creds })}
					readOnly={readOnly}
				/></div>
			</>,
		}[authEdit.mode]}

		<div style={{ display: "flex", gap: 5 }}>
			<Button children={readOnly ? "CLOSE" : "CANCEL"}
				onClick={() => onClose(null)}
			/>
			{!readOnly && (
				<Button children="SAVE"
					onClick={() => onClose(authEdit)}
				/>
			)}
		</div>
	</div>

}

export default AuthForm
