import React, { FunctionComponent } from "react"



interface Props {
	checked?: boolean
	label?: string
	onClick?: (e:React.MouseEvent) => void
}

const Switch: FunctionComponent<Props> = ({
	checked,
	label,
	onClick,
}) => {

	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return (
		<div style={cssContainer(checked)}
			onClick={onClick}
		>
			{label}
		</div>
	)
}

export default Switch

const cssContainer = (checked:boolean) => ({

})
