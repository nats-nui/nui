import CheckOffIcon from "@/icons/CheckOffIcon"
import CheckOnIcon from "@/icons/CheckOnIcon"
import React, { FunctionComponent, useState } from "react"



interface Props {
	check: boolean
	trueIcon?: React.ReactNode
	falseIcon?: React.ReactNode
	style?: React.CSSProperties
	readOnly?: boolean
	onChange?: (check: boolean, e?: React.MouseEvent) => void
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
	const [enter, setEnter] = useState(false)

	// HANDLER
	const handleClick = (e: React.MouseEvent) => {
		if (readOnly) return
		onChange?.(!check, e)
	}

	// RENDER

	return (
		<div style={{ ...cssRoot(check, readOnly, enter), ...style }}
			onClick={handleClick}
			onMouseEnter={() => setEnter(true)}
			onMouseLeave={() => setEnter(false)}
		>
			{check ? trueIcon : falseIcon}
		</div>
	)
}

export default IconToggle

const cssRoot = (check: boolean, readOnly: boolean, enter: boolean): React.CSSProperties => ({
	display: "flex",
	...readOnly ? null : { cursor: "pointer" },
	opacity: check || (enter && !readOnly) ? 1 : 0.5,
	//padding: 5,
})