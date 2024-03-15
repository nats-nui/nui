import { FunctionComponent } from "react"



interface Props {
	style?: React.CSSProperties
	className?: string
	children?: React.ReactNode
}

const Form: FunctionComponent<Props> = ({
	style,
	className,
	children,
}) => {

	// STORE

	// HOOK

	// HANDLER

	// RENDER
	return (
		<div style={{ ...cssRoot, ...style }} className={className}>
			{children}
		</div>
	)
}

export default Form

const cssRoot: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: 7,
	//marginBottom: 15,
}
