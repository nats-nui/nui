import React, { FunctionComponent } from "react"



interface Props {
	check: boolean
	onChange?: (check: boolean) => void
	trueIcon?: React.ReactNode
	falseIcon?: React.ReactNode
	style?: React.CSSProperties
}

const IconToggle: FunctionComponent<Props> = ({
	check,
	onChange,
	trueIcon,
	falseIcon,
	style,
}) => {
	// STORE

	// HOOK

	// HANDLER
	const handleClick = () => onChange?.(!check)

	// RENDER

	return (
		<div style={{ ...cssContainer, ...style }}
			onClick={handleClick}
		>
			{check ? trueIcon : falseIcon}
		</div>
	)
}

export default IconToggle

const cssContainer: React.CSSProperties = {
	display: "flex",
	cursor: "pointer",
	padding: 5,
}
