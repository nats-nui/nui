import CheckOffIcon from "@/icons/CheckOffIcon"
import CheckOnIcon from "@/icons/CheckOnIcon"
import React, { FunctionComponent } from "react"



interface Props {
	check: boolean
	trueIcon?: React.ReactNode
	falseIcon?: React.ReactNode
	style?: React.CSSProperties
	readOnly?: boolean
	onChange?: (check: boolean) => void
}

const IconToggle: FunctionComponent<Props> = ({
	check,
	trueIcon = <CheckOnIcon />,
	falseIcon = <CheckOffIcon />,
	style,
	readOnly,
	onChange,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleClick = () => {
		if (readOnly) return
		onChange?.(!check)
	}

	// RENDER

	return (
		<div style={{ ...cssRoot(readOnly), ...style }}
			onClick={handleClick}
		>
			{check ? trueIcon : falseIcon}
		</div>
	)
}

export default IconToggle

const cssRoot = (readOnly: boolean): React.CSSProperties => ({
	display: "flex",
	...readOnly ? null : { cursor: "pointer" },
	//padding: 5,
})