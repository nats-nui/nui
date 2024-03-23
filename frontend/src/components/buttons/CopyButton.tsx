import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import CopyIcon from "@/icons/CopyIcon"
import { FunctionComponent } from "react"
import cls from "./CopyButton.module.css"



interface Props {
	value?: string | (() => string)
	absolute?: boolean
	label?:string
	className?: string
	style?: React.CSSProperties
}

const CopyButton: FunctionComponent<Props> = ({
	value,
	absolute,
	label = "COPY",
	className,
	style,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleClipboardClick = (e: React.MouseEvent<Element, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
		let txt = typeof value == "function" ? value() : value
		navigator.clipboard.writeText(txt)
	}

	// RENDER
	return (
		<TooltipWrapCmp
			className={`${absolute ? `${cls.absolute} hover-show` : ""} ${className}`}
			style={style}
			content={label}
		>
			<IconButton onClick={handleClipboardClick}>
				<CopyIcon />
			</IconButton>
		</TooltipWrapCmp>
	)
}

export default CopyButton
