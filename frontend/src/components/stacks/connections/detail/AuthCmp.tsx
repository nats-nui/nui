import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent } from "react"
import { PasswordInput, TextInput, TooltipWrapCmp } from "@priolo/jack"

interface Props {
	auth: Auth
	onPropChange: (prop: Partial<Auth>) => void
	readOnly?: boolean
}

const AuthCmp: FunctionComponent<Props> = ({
	auth,
	onPropChange,
	readOnly = false,
}) => {

	if ( !auth || !auth.mode ) return null

	const authFieldsMap = {
		[AUTH_MODE.USER_PASSWORD]: <>
			<div className="jack-lyt-form"><div className="jack-lbl-prop">USERNAME</div><TextInput
				value={auth.username}
				onChange={username => onPropChange({ username })}
				readOnly={readOnly}
			/></div>
			<div className="jack-lyt-form"><div className="jack-lbl-prop">PASSWORD</div><PasswordInput
				value={auth.password}
				onChange={password => onPropChange({ password })}
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
					value={auth.token}
					onChange={token => onPropChange({ token })}
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
					value={auth.username}
					onChange={username => onPropChange({ username })}
					readOnly={readOnly}
				/></div>
			<div className="jack-lyt-form">
				<div className="jack-lbl-prop lbl-info-container">NKEY SEED
					<TooltipWrapCmp className="lbl-info" children="?"
						content="Private NKEY seed used to sign server challenge. It starts with 'S'"
					/>
				</div>
				<PasswordInput
					value={auth.nKeySeed}
					onChange={nKeySeed => onPropChange({ nKeySeed })}
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
					value={auth.jwt}
					onChange={jwt => onPropChange({ jwt })}
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
					value={auth.nKeySeed}
					onChange={nKeySeed => onPropChange({ nKeySeed })}
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
					value={auth.jwt}
					onChange={jwt => onPropChange({ jwt })}
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
					value={auth.creds}
					onChange={creds => onPropChange({ creds })}
					readOnly={readOnly}
				/>
			</div>
		</>,
	}

	return authFieldsMap[auth.mode] || null
}

export default AuthCmp
