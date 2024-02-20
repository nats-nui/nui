import layoutSo from "@/stores/layout"
import tooltipSo from "@/stores/tooltip"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { Position } from "../stores/mouse/utils"



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
		const observeTarget = ref.current;
		if (!observeTarget) return
		const resizeObserver = new ResizeObserver((entries) => {

			const contentRect = tooltipSo.state.content?.rect
			if (!contentRect) return
			const pos: TooltipPos = {
				position: { x: contentRect.x + (contentRect.width / 2), y: contentRect.y },
				hook: TOOLTIP_HOOK.UP,
				offset: 0,
			}
			entries.forEach((entry) => {
				const entryRect = entry.contentRect
				const tipHeight = entryRect.height + 20
				if (contentRect.y - tipHeight < 0) {
					pos.position.y = contentRect.bottom + tipHeight
					pos.hook = TOOLTIP_HOOK.DOWN
				}
				const offset = (entryRect.width - contentRect.width) / 2
				if (contentRect.left - offset < 0) pos.offset = offset
				if (contentRect.right + offset > window.innerWidth) pos.offset = -offset
				console.log("sxsx",entry)
				
			})
			setPosition(pos)
		});
		resizeObserver.observe(observeTarget);
		return () => resizeObserver.unobserve(observeTarget)
	}, [tooltipSa.show])

	// HANDLERS

	// RENDER
	const content = tooltipSa.content?.content
	const variant = tooltipSa.content?.variant
	const show = tooltipSa.show

	return (
		<div ref={ref} style={cssRoot(position, show)}>
			{content && (
				<div style={cssContent(variant)}>
					{content}
					<div style={cssArrow(position, variant)} />
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

	left: pos?.position.x + pos?.offset,
	top: pos?.position.y,

	transitionProperty: 'opacity, transform',
	transitionDuration: "300ms",
	transitionTimingFunction: layoutSo.state.theme.transitions[0],
	transform: show ? 'translate(0, -5px)' : 'translate(0, 5px)',
	opacity: show ? 1 : 0,
})

const cssContent = (variant: number = 0): React.CSSProperties => ({
	transform: 'translate(-50%, calc( -100% - 5px ) )',
	fontSize: 11,
	fontWeight: 700,
	padding: '6px 8px',
	borderRadius: 5,
	backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
	color: layoutSo.state.theme.palette.var[variant].fg,
	boxShadow: layoutSo.state.theme.shadows[0],
})

const cssArrow = (pos: TooltipPos, variant: number = 0): React.CSSProperties => ({
	position: 'absolute',
	...pos?.hook == TOOLTIP_HOOK.UP ? {
		bottom: -10,
		borderColor: `${layoutSo.state.theme.palette.var[variant].bg} transparent transparent transparent`
	} : {
		top: -10,
		borderColor: `transparent transparent ${layoutSo.state.theme.palette.var[variant].bg} transparent`,
	},
	right: `calc( 50% - ${5 - (pos?.offset ?? 0)}px )`,
	borderWidth: 5,
	borderStyle: 'solid',
})