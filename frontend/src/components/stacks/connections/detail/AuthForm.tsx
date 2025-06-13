import { AUTH_MODE, Auth } from "@/types"
import { FunctionComponent, useEffect, useState } from "react"
import { Button, StringUpRow, Options } from "@priolo/jack"
import AuthCmp from "./AuthCmp"



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

		
		<AuthCmp
			auth={authEdit}
			onPropChange={handlePropChange}
			readOnly={readOnly}
		/>

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
