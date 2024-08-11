import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent, useEffect, useState } from "react"
import { Button, PasswordInput, StringUpRow, TextInput, TooltipWrapCmp, Options } from "@priolo/jack"



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
			mode: AUTH_MODE.TOKEN, creds: "", jwt: "", nKeySeed: "", password: "", token: "", username: ""
		})
	}, [auth])

	// HANDLER
	const handlePropChange = (prop: Partial<Auth>) => setAuthEdit({ ...authEdit, ...prop })
	const authItems = Object.values(AUTH_MODE)

	// RENDER
	if (!authEdit) return null
	return <div className="jack-lyt-form">

		<div className="lbl-info-container">
			<Options<string> style={{ marginBottom: 8 }}
				className={readOnly ? "jack-lbl-prop-title" : ""}
				value={authEdit?.mode?.toUpperCase()}
				items={authItems}
				RenderRow={StringUpRow}
				readOnly={readOnly}
				onSelect={(mode) => handlePropChange({ mode: mode as AUTH_MODE })}
			/>
			{/* <TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
				style={{ top: readOnly ? 7 : 3, backgroundColor: "#BBFB35" }}
				content="una bella spiegazione completa"
			/> */}
		</div>

		{{
			[AUTH_MODE.USER_PASSWORD]: <>
				<div className="jack-lyt-form"><div className="jack-lbl-prop">USERNAME</div><TextInput
					value={authEdit.username}
					onChange={username => handlePropChange({ username })}
					readOnly={readOnly}
				/></div>
				<div className="jack-lyt-form"><div className="jack-lbl-prop">PASSWORD</div><PasswordInput
					value={authEdit.password}
					onChange={password => handlePropChange({ password })}
					readOnly={readOnly}
				/></div>
			</>,
			[AUTH_MODE.TOKEN]: (
				<div className="jack-lyt-form">
					<div className="jack-lbl-prop lbl-info-container">TOKEN
						<TooltipWrapCmp className="lbl-info" children="?"
							content="Client token string specified in authorization config of the server"
						/>
					</div>
					<TextInput
						value={authEdit.token}
						onChange={token => handlePropChange({ token })}
						readOnly={readOnly}
					/>
				</div>
			),
			[AUTH_MODE.NKEY]: <>
				<div className="jack-lyt-form">
					<div className="jack-lbl-prop lbl-info-container">PUBLIC NKEY
						<TooltipWrapCmp className="lbl-info" children="?"
							content="NATS public NKEY representing the user. It starts with 'U'"
						/>
					</div>
					<TextInput
						value={authEdit.username}
						onChange={username => handlePropChange({ username })}
						readOnly={readOnly}
					/></div>
				<div className="jack-lyt-form">
					<div className="jack-lbl-prop lbl-info-container">NKEY SEED
						<TooltipWrapCmp className="lbl-info" children="?"
							content="Private NKEY seed used to sign server challenge. It starts with 'S'"
						/>
					</div>
					<PasswordInput
						value={authEdit.nKeySeed}
						onChange={nKeySeed => handlePropChange({ nKeySeed })}
						readOnly={readOnly}
					/></div>
			</>,
			[AUTH_MODE.JWT]: <>
				<div className="jack-lyt-form">
					<div className="jack-lbl-prop lbl-info-container">JWT
						<TooltipWrapCmp className="lbl-info" children="?"
							content="User JWT string to couple with private NKEY"
						/>
					</div>
					<TextInput
						value={authEdit.jwt}
						onChange={jwt => handlePropChange({ jwt })}
						readOnly={readOnly}
					/>
				</div>
				<div className="jack-lyt-form">
					<div className="jack-lbl-prop lbl-info-container">NKEY SEED
						<TooltipWrapCmp className="lbl-info" children="?"
							content="Private NKEY seed used to sign server challenge. It starts with 'S'"
						/>
					</div>
					<TextInput
						value={authEdit.nKeySeed}
						onChange={nKeySeed => handlePropChange({ nKeySeed })}
						readOnly={readOnly}
					/>
				</div>
			</>,
			[AUTH_MODE.BEARER_JWT]: <>
				<div className="jack-lyt-form">
					<div className="jack-lbl-prop lbl-info-container">BEARER JWT
						<TooltipWrapCmp className="lbl-info" children="?"
							content="NATS user JWT as bearer token (with no nuance)"
						/>
					</div>
					<TextInput
						value={authEdit.jwt}
						onChange={jwt => handlePropChange({ jwt })}
						readOnly={readOnly}
					/>
				</div>
			</>,
			[AUTH_MODE.CREDS_FILE]: <>
				<div className="jack-lyt-form">
					<div className="jack-lbl-prop lbl-info-container">CREDS PATH FILE
						<TooltipWrapCmp className="lbl-info" children="?"
							content="Local path of NATS .creds file containing JWT and NKEY seed"
						/>
					</div>
					<TextInput
						value={authEdit.creds}
						onChange={creds => handlePropChange({ creds })}
						readOnly={readOnly}
					/>
				</div>
			</>,
		}[authEdit.mode]}

		<div className="cmp-footer">
			{!readOnly && (
				<Button children="SAVE"
					onClick={() => onClose(authEdit)}
				/>
			)}
			<Button children={readOnly ? "CLOSE" : "CANCEL"}
				onClick={() => onClose(null)}
			/>
		</div>
	</div>

}

export default AuthForm
