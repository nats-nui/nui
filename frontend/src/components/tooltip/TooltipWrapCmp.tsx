import tooltipSo from "@/stores/tooltip"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useId, useLayoutEffect } from "react"



interface Props {
	content?: React.ReactNode
	disabled?: boolean
	style?: React.CSSProperties
	className?: string
	onMouseOver?: (enter: boolean) => void
	onClick?: (e: React.MouseEvent) => void
	children: React.ReactNode
}

const TooltipWrapCmp: FunctionComponent<Props> = ({
	content,
	disabled,
	style,
	className,
	onMouseOver,
	onClick,
	children
}) => {

	// STORES
	const tooltipSa = useStore(tooltipSo)

	// HOOKS
	const id = useId()
	useEffect(() => {
		if ( disabled ) handleLeave()
		return () => {
			if (tooltipSo.state.content?.id != id) return
			handleLeave()
		}
	}, [disabled])


	// HANDLERS
	const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
		if ( disabled ) return
		const elem = e.target as HTMLElement

		const colorRef = e.currentTarget.querySelector('#colorRef')
		var stili = window.getComputedStyle(colorRef);
		var color = stili.getPropertyValue('color');

		const rect = elem.getBoundingClientRect()

		tooltipSo.open({
			content,
			targetRect: rect,
			color,
			id,
		})
		onMouseOver?.(true)
	}
	const handleLeave = (e?: React.MouseEvent<HTMLDivElement>) => {
		tooltipSo.close()
		onMouseOver?.(false)
	}

	// RENDER
	if (!content) return children

	return (
		<div style={style} className={className}
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
			onClick={onClick}
		>
			<div id="colorRef" style={{ display: "none" }} className="color-fg" />
			{children}
		</div>
	)
}

export default TooltipWrapCmp
