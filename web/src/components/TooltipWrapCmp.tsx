import tooltipSo from "@/stores/tooltip"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"

interface Props {
	content?: React.ReactNode
	variant?: number
	style?: React.CSSProperties
	children: React.ReactNode
}

const TooltipWrapCmp: FunctionComponent<Props> = ({
	content,
	variant,
	style,
	children
}) => {

	// STORES
	const tooltipSa = useStore(tooltipSo)

	// HOOKS

	// HANDLERS
	const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
		const elem = e.target as HTMLElement
		const { x, y, width, height } = elem.getBoundingClientRect();
		tooltipSo.open({ 
			content, 
			position: { x: x + (width / 2), y }, 
			variant,
		})
	}
	const handleLeave = () => {
		tooltipSo.close()
	}

	// RENDER
	return (
		<div style={style}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>{children}</div>
	)
}

export default TooltipWrapCmp
