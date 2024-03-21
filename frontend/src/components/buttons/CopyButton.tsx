import TooltipWrapCmp from "@/components/TooltipWrapCmp"
import IconButton from "@/components/buttons/IconButton"
import CopyIcon from "@/icons/CopyIcon"
import { FunctionComponent } from "react"
import cls from "./CopyButton.module.css"



interface Props {
	value?: string | (() => string)
	absolute?: boolean
	className?: string
	style?: React.CSSProperties
}

const CopyButton: FunctionComponent<Props> = ({
	value,
	absolute,
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
			content="COPY"
		>
			<IconButton onClick={handleClipboardClick}>
				<CopyIcon />
			</IconButton>
		</TooltipWrapCmp>
	)
}

export default CopyButton
