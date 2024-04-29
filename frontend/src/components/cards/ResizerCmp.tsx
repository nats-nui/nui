import React, { FunctionComponent } from "react"



export enum RESIZER_DIRECTION {
	HORIZONTAL = "horizontal",
	VERTICAL = "vertical",
}

interface Props {
	children?: React.ReactNode
	className?: string
	style?: React.CSSProperties
	direction?: RESIZER_DIRECTION
	onStart?: (pos: number) => number
	onMove?: (pos: number, diff?: number) => void
	onStop?: () => void
	onDClick?: ()=>void
}

/** Il contenitore CARD. Gestisce il drag e posizionamento del DECK */
const ResizerCmp: FunctionComponent<Props> = ({
	children,
	className,
	style,
	direction = RESIZER_DIRECTION.HORIZONTAL,
	onStart,
	onMove,
	onStop,
	onDClick,
}) => {

	// STORES

	// HOOKS

	// HANDLER
	const handleDown = (e: React.MouseEvent) => {
		const startX = direction == RESIZER_DIRECTION.HORIZONTAL ? e.clientX : e.clientY
		const startWidth = onStart?.(startX)
		const mouseMove = (ev: MouseEvent) => {
			const currentX = direction == RESIZER_DIRECTION.HORIZONTAL ? ev.clientX : ev.clientY
			const diffX = startX - currentX
			onMove?.(startWidth, diffX)
		}
		const mouseUp = (ev: MouseEvent) => {
			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mouseup', mouseUp);
			onStop?.()
		}
		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mouseup', mouseUp);
	}

	// RENDER
	return <div
		className={className}
		style={style}
		children={children}
		draggable={false}
		onMouseDown={handleDown}
		onDoubleClick={onDClick}
	/>
}

export default ResizerCmp
