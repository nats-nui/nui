export { CopyButton as default } from "@priolo/jack"

// import TooltipWrapCmp from "@/components/tooltip/TooltipWrapCmp"
// import IconButton from "@/components/buttons/IconButton"
// import CopyIcon from "@/icons/CopyIcon"
// import { FunctionComponent } from "react"
// import cls from "./CopyButton.module.css"



// interface Props {
// 	value?: string | (() => string)
// 	absolute?: boolean
// 	label?: string
// 	className?: string
// 	style?: React.CSSProperties
// }

// const CopyButton: FunctionComponent<Props> = ({
// 	value,
// 	absolute,
// 	label = "COPY",
// 	className,
// 	style,
// }) => {

// 	// STORE

// 	// HOOKs

// 	// HANDLER
// 	const handleClipboardClick = (e: React.MouseEvent<Element, MouseEvent>) => {
// 		e.preventDefault()
// 		e.stopPropagation()
// 		let txt = typeof value == "function" ? value() : value
// 		clipboardSet(txt)
// 		//navigator?.clipboard?.writeText(txt)
// 	}

// 	// RENDER
// 	label = navigator?.clipboard == null ? "CLIPBOARD NOT AVAILABLE.\nHave you given permission?" : label
// 	return (
// 		<TooltipWrapCmp
// 			className={`${absolute ? `${cls.absolute} hover-show` : ""} ${className}`}
// 			style={style}
// 			content={label}
// 		>
// 			<IconButton
// 				onClick={handleClipboardClick}
// 			>
// 				<CopyIcon />
// 			</IconButton>
// 		</TooltipWrapCmp>
// 	)
// }

// export default CopyButton

// /**
//  * Copia in clipboard un testo
//  * @param text da copiare nella clipboard
//  */
// function clipboardSet(text: string): void {
// 	const el = document.createElement('textarea');
// 	el.value = text;
// 	document.body.appendChild(el);
// 	el.select();
// 	document.execCommand('copy');
// 	document.body.removeChild(el);
// };