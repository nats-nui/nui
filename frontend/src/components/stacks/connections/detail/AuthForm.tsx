import Options from "@/components/Options"
import Button from "@/components/buttons/Button"
import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import TextInput from "../../../input/TextInput"
import StringUpRow from "@/components/rows/StringUpRow"
import PasswordInput from "@/components/input/PasswordInput"
import TooltipWrapCmp from "@/components/tooltip/TooltipWrapCmp"
import { COLOR_VAR } from "@/stores/layout"



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
	return <div className="lyt-form var-dialog">

		<div className="lbl-info-container">
			<Options<string> style={{ marginBottom: 8 }}
				className={readOnly ? "lbl-prop-title" : ""}
				value={authEdit?.mode?.toUpperCase()}
				items={authItems}
				RenderRow={StringUpRow}
				readOnly={readOnly}
				onSelect={(mode) => handlePropChange({ mode: mode as AUTH_MODE })}
			/>
			{/* <TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
				style={{ top: readOnly ? 7 : 3, backgroundColor: "var(--var-1)" }}
				content="una bella spiegazione completa"
			/> */}
		</div>

		{{
			[AUTH_MODE.USER_PASSWORD]: <>
				<div className="lyt-form"><div className="lbl-prop">USERNAME</div><TextInput
					value={authEdit.username}
					onChange={username => handlePropChange({ username })}
					readOnly={readOnly}
				/></div>
				<div className="lyt-form"><div className="lbl-prop">PASSWORD</div><PasswordInput
					value={authEdit.password}
					onChange={password => handlePropChange({ password })}
					readOnly={readOnly}
				/></div>
			</>,
			[AUTH_MODE.TOKEN]: (
				<div className="lyt-form">
					<div className="lbl-prop lbl-info-container">TOKEN
						<TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
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
				<div className="lyt-form">
					<div className="lbl-prop lbl-info-container">PUBLIC NKEY
						<TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
										content="NATS public NKEY representing the user. It starts with 'U'"
						/>
					</div>
					<TextInput
						value={authEdit.username}
						onChange={username => handlePropChange({username})}
						readOnly={readOnly}
					/></div>
				<div className="lyt-form">
					<div className="lbl-prop lbl-info-container">NKEY SEED
						<TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
										content="Private NKEY seed used to sign server challenge. It starts with 'S'"
						/>
					</div>
					<PasswordInput
						value={authEdit.nKeySeed}
						onChange={nKeySeed => handlePropChange({nKeySeed})}
						readOnly={readOnly}
					/></div>
			</>,
			[AUTH_MODE.JWT]: <>
				<div className="lyt-form">
					<div className="lbl-prop lbl-info-container">JWT
						<TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
										content="User JWT string to couple with private NKEY"
						/>
					</div>
					<TextInput
						value={authEdit.jwt}
						onChange={jwt => handlePropChange({ jwt })}
						readOnly={readOnly}
					/>
				</div>
				<div className="lyt-form">
					<div className="lbl-prop lbl-info-container">NKEY SEED
						<TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
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
				<div className="lyt-form">
					<div className="lbl-prop lbl-info-container">BEARER JWT
						<TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
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
				<div className="lyt-form">
					<div className="lbl-prop lbl-info-container">CREDS PATH FILE
						<TooltipWrapCmp colorVar={COLOR_VAR.CYAN} className="lbl-info" children="?"
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
