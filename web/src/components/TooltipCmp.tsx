import layoutSo from "@/stores/layout"
import tooltipSo from "@/stores/tooltip"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { Position } from "../stores/mouse/utils"



const TooltipCmp: FunctionComponent = () => {

	// STORES
	const tooltipSa = useStore(tooltipSo)

	// HOOKS

	// HANDLERS

	// RENDER
	if (!tooltipSa.content) return null
	const variant = tooltipSa.content.variant
	const pos = tooltipSa.content.position
	const show = tooltipSa.show
	const content = tooltipSa.content.content

	if (!content) return null
	return (
		<div style={cssRoot(pos, show)}>
			<div style={cssContent(variant)}>
				{content}
				<div style={cssArrow(variant)} />
			</div>
		</div>
	)
}

export default TooltipCmp

const cssRoot = (pos: Position = { x: 0, y: 0 }, show: boolean = false): React.CSSProperties => ({
	pointerEvents: "none",
	zIndex: 99999,
	position: 'absolute',

	left: pos?.x,
	top: pos?.y,

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

const cssArrow = (variant: number = 0): React.CSSProperties => ({
	position: 'absolute',
	bottom: -10,
	right: 'calc( 50% - 5px )',
	borderWidth: 5,
	borderStyle: 'solid',
	borderColor: `${layoutSo.state.theme.palette.var[variant].bg} transparent transparent`
})