import CloseIcon from "@/icons/CloseIcon"
import FindIcon from "@/icons/FindIcon"
import { FunctionComponent, useState } from "react"
import IconButton from "../buttons/IconButton"
import TextInput, { TextInputProps } from "./TextInput"
import EyeIcon from "@/icons/EyeIcon"
import EyeOffIcon from "@/icons/EyeOffIcon"



interface Props extends TextInputProps {
}

const PasswordInput: FunctionComponent<Props> = ({
	...props
}) => {

	// STORE
	const [hide, setHide] = useState<boolean>(true)

	// HOOK

	// HANDLER

	// RENDER
	return <div className="cmp-h">
		<TextInput
			{...props}
			type={hide ? "password" : null}
		/>
		<IconButton onClick={() => setHide(!hide)}>
			{hide ? (
				<EyeOffIcon />
			) : (
				<EyeIcon />
			)}
		</IconButton>
	</div>
}

export default PasswordInput
