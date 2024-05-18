import layoutSo from "@/stores/layout"
import tooltipSo from "@/stores/tooltip"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { Position } from "../../stores/mouse/utils"



enum TOOLTIP_HOOK {
	UP,
	DOWN,
}

interface TooltipPos {
	position: Position
	hook: TOOLTIP_HOOK
	offset: number
}

const TooltipCmp: FunctionComponent = () => {

	// STORES
	const tooltipSa = useStore(tooltipSo)
	
	// HOOKS
	const ref = useRef(null)
	const [position, setPosition] = useState<TooltipPos>(null)
	
	useEffect(() => {
		const targetRect = tooltipSo.state.content?.targetRect
		if (!tooltipSa.show || !targetRect || !ref.current ) return

		const contentRect = ref.current.getBoundingClientRect()
		const pos: TooltipPos = {
			position: { x: targetRect.x + (targetRect.width / 2), y: targetRect.y },
			hook: TOOLTIP_HOOK.UP,
			offset: 0,
		}
		const tipHeight = contentRect.height + 20
		if (targetRect.y - tipHeight < 0) {
			pos.position.y = targetRect.bottom + tipHeight
			pos.hook = TOOLTIP_HOOK.DOWN
		}
		const offset = (contentRect.width - targetRect.width) / 2
		if (targetRect.left - offset < 0) pos.offset = offset
		if (targetRect.right + offset > window.innerWidth) pos.offset = -offset
		setPosition(pos)
	}, [tooltipSa.show, tooltipSo.state.content])

	// HANDLERS

	// RENDER
	const content = tooltipSa.content?.content
	const show = tooltipSa.show
	const color = tooltipSa.content?.color

	return (
		<div ref={ref} style={cssRoot(position, show)}>
			{content && (
				<div style={cssContent(color)}>
					{content}
					<div style={cssArrow(position, color)} />
				</div>
			)}
		</div>
	)
}

export default TooltipCmp

const cssRoot = (pos: TooltipPos, show: boolean = false): React.CSSProperties => ({
	pointerEvents: "none",
	zIndex: 99999,
	position: 'absolute',

	left: pos ? pos.position.x + pos.offset : null,
	top: pos ? pos.position.y : null,

	transitionProperty: 'opacity, transform',
	transitionDuration: "300ms",
	transitionTimingFunction: layoutSo.state.theme.transitions[0],
	transform: show ? 'translate(0, -5px)' : 'translate(0, 5px)',
	opacity: show ? 1 : 0,

	whiteSpace: "pre-line",
})

const cssContent = (color:string): React.CSSProperties => ({
	transform: 'translate(-50%, calc( -100% - 5px ) )',
	fontSize: 11,
	fontWeight: 700,
	padding: '6px 8px',
	borderRadius: 5,
	backgroundColor: color,
	color: "#393939",
	
	boxShadow: layoutSo.state.theme.shadows[0],
})

const cssArrow = (pos: TooltipPos, color:string): React.CSSProperties => ({
	position: 'absolute',
	...pos?.hook == TOOLTIP_HOOK.UP ? {
		bottom: -10,
		borderColor: `${color} transparent transparent transparent`
	} : {
		top: -10,
		borderColor: `transparent transparent ${color} transparent`,
	},
	right: `calc( 50% - ${5 - (pos?.offset ?? 0)}px )`,
	borderWidth: 5,
	borderStyle: 'solid',
})