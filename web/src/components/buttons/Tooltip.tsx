import layoutSo, { COLOR_VAR } from "@/stores/layout";
import { FunctionComponent, useRef, useState } from 'react';



interface Props {
	content?: React.ReactNode
	children: React.ReactNode
	variant?: number
}

const Tooltip: FunctionComponent<Props> = ({
	content,
	children,
	variant = COLOR_VAR.GREEN,
}) => {
	// HOOKS
	const [enter, setEnter] = useState(false)
	const [show, setShow] = useState(false)
	const timeout = useRef<any>(0)

	// HANDLERS
	const handleEnter = () => {
		setEnter(true)
		setShow(false)
		anim(true, 400)
	}
	const handleLeave = () => {
		setShow(false)
		anim(false, 300)
	}
	const anim = (show:boolean, time:number) => {
		clearTimeout(timeout.current)
		timeout.current = setTimeout(() => {
			if ( show ) setShow(true); else setEnter(false)
			clearTimeout(timeout.current)
			timeout.current = 0
		}, time)
	}

	// RENDER

	return (
		<div style={cssRoot}>
			{enter && (
				<div style={cssContent(variant, show)}>
					{content}
					<span style={cssArrow(variant)} />
				</div>
			)}
			<div
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
			>{children}</div>
		</div>
	);
};

export default Tooltip

const cssRoot: React.CSSProperties = {
	position: "relative",
}
const cssContent = (variant: number, show: boolean): React.CSSProperties => ({
	zIndex: 0,
	position: 'absolute',
	backgroundColor: layoutSo.state.theme.palette.var[variant].bg,
	color: layoutSo.state.theme.palette.var[variant].fg,
	padding: '6px 8px',
	borderRadius: 5,
	right: 0,
	fontSize: 11,
	fontWeight: 700,

	transitionProperty: 'bottom, opacity',
	transitionDuration: "300ms",
	transitionTimingFunction: layoutSo.state.theme.transitions[0],

	opacity: show ? 1 : 0,
	bottom: show ? 'calc( 100% + 5px )' : 'calc( 100% + 0px )'
})
const cssArrow = (variant: number): React.CSSProperties => ({
	position: 'absolute',
	bottom: -10,
	right: 8,
	borderWidth: 5,
	borderStyle: 'solid',
	borderTopColor: layoutSo.state.theme.palette.var[variant].bg,
	//borderColor: rgba(0, 0, 0, 0.7) transparent transparent
})