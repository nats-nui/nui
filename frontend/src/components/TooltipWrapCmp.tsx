import tooltipSo from "@/stores/tooltip"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"



interface Props {
	content?: React.ReactNode
	style?: React.CSSProperties
	className?:string
	onMouseOver?: (enter: boolean) => void
	children: React.ReactNode
}

const TooltipWrapCmp: FunctionComponent<Props> = ({
	content,
	style,
	className,
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

		const colorRef = e.currentTarget.querySelector('#colorRef')
		var stili = window.getComputedStyle(colorRef);
		var color = stili.getPropertyValue('color');

		const rect = elem.getBoundingClientRect()
		tooltipSo.open({
			content,
			targetRect: rect,
			color,
		})
		onMouseOver?.(true)
	}
	const handleLeave = () => {
		tooltipSo.close()
		onMouseOver?.(false)
	}

	// RENDER
	if (!content) return children

	return (
		<div style={style} className={className}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			<div id="colorRef" style={{display: "none"}} className="color-fg"/>
			{children}
		</div>
	)
}

export default TooltipWrapCmp
