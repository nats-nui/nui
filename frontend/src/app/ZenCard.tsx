import RootCard from "@/components/cards/RootCard"
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
	if (!docsSa.zenCard) return null
	const clsOpen = docsSa.zenOpen ? cls.open : ""

	return (

		<div ref={ref} id="zen-container"
			className={`${cls.root} ${clsOpen}`}
			onClick={handleClose}
		>
			<div className={cls.container}>
				<RootCard
					view={docsSa.zenCard}
				/>
			</div>
		</div>
	)
}

export default ZenCard
