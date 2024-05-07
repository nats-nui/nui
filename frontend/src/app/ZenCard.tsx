import docsSo from "@/stores/docs"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useRef } from "react"
import cls from "./ZenCard.module.css"



interface Props {
}

const ZenCard: FunctionComponent<Props> = ({
}) => {

	// STORES
	const docsSa = useStore(docsSo)

	// HOOKS
	const ref = useRef(null)

	// HANDLERS
	const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		if (e.target != ref.current) return
		docsSo.zenClose()
	}

	// RENDER
	const clsOpen = docsSa.zenOpen ? cls.open : ""
	const clsHide = !docsSa.zenCard ? cls.hide : ""

	return (
		<div ref={ref}
			className={`${cls.root} ${clsOpen} ${clsHide}`}
			onClick={handleClose}
		>
			<div className={cls.container} id="zen-card" />
		</div>
	)
}

export default ZenCard
