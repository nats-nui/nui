import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent, useRef } from "react"
import { PasswordInput, TextInput, TooltipWrapCmp } from "@priolo/jack"

/** placeholder the server sends instead of a stored secret (see internal/connection/redact.go) */
const REDACTED = "__nui_redacted__"
const isRedacted = (value?: string) => !!value?.startsWith(REDACTED)

interface SecretInputProps {
	value?: string
	onChange: (value: string) => void
	readOnly?: boolean
	password?: boolean
}

/**
 * Input for a secret the server never sends back: a stored secret shows as empty
 * with a hint, and leaving the field empty keeps the stored value.
 */
const SecretInput: FunctionComponent<SecretInputProps> = ({
	value,
	onChange,
	readOnly,
	password,
}) => {
	const placeholder = useRef<string>(null)
	if (isRedacted(value)) placeholder.current = value
	const Input = password ? PasswordInput : TextInput
	return <>
		<Input
			value={isRedacted(value) ? "" : value}
			onChange={v => onChange(v === "" && placeholder.current ? placeholder.current : v)}
			readOnly={readOnly}
		/>
		{isRedacted(value) && (
			<div className="jack-lbl-prop" style={{ opacity: 0.6 }}>
				{readOnly ? "stored on server" : "stored on server, type to replace"}
			</div>
		)}
	</>
}

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
			<div className="jack-lyt-form"><div className="jack-lbl-prop">PASSWORD</div><SecretInput password key="password"
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
				<SecretInput key="token"
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
				<SecretInput password key="nkey-seed"
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
				<SecretInput key="jwt"
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
				<SecretInput password key="jwt-nkey-seed"
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
				<SecretInput key="bearer-jwt"
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
