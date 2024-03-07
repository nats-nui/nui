import tooltipSo from "@/stores/tooltip"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"

interface Props {
	content?: React.ReactNode
	variant?: number
	style?: React.CSSProperties
	onMouseOver?: (enter: boolean) => void
	children: React.ReactNode
}

const TooltipWrapCmp: FunctionComponent<Props> = ({
	content,
	variant,
	style,
	onMouseOver,
	children
}) => {

	// STORES
	const tooltipSa = useStore(tooltipSo)

	// HOOKS
	useEffect(() => handleLeave, [])

	// HANDLERS
	const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
		const elem = e.target as HTMLElement
		const rect = elem.getBoundingClientRect()
		tooltipSo.open({ 
			content,
			targetRect: rect,
			variant,
		})
		onMouseOver?.(true)
	}
	const handleLeave = () => {
		console.log("leave")
		tooltipSo.close()
		onMouseOver?.(false)
	}

	// RENDER
	if ( !content ) return children
	
	return (
		<div style={style}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>{children}</div>
	)
}

export default TooltipWrapCmp
