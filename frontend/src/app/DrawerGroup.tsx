import CompressAllIcon from "@/icons/CompressAllIcon"
import DirectionDownIcon from "@/icons/DirectionDownIcon"
import DirectionLeftIcon from "@/icons/DirectionLeftIcon"
import DirectionRightIcon from "@/icons/DirectionRightIcon"
import DirectionUpIcon from "@/icons/DirectionUpIcon"
import MenuBottomIcon from "@/icons/MenuBottomIcon"
import MenuRightIcon from "@/icons/MenuRightIcon"
import docsSo, { DRAWER_POSITION } from "@/stores/docs"
import { drawerCardsSo as drawerSo } from "@/stores/docs/cards"
import { forEachViews } from "@/stores/docs/utils/manage"
import { delay } from "@/utils/time"
import { CardsGroup, IconButton, RESIZER_DIRECTION, ResizerCmp, VIEW_SIZE } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import PolymorphicCard from "../components/cards/PolymorphicCard"
import cls from "./DrawerGroup.module.css"


interface Props {
}

const DrawerGroup: FunctionComponent<Props> = ({

}) => {

	// STORES
	const drawerSa = useStore(drawerSo)
	const docsSa = useStore(docsSo)
	const inRight = docsSa.drawerPosition == DRAWER_POSITION.RIGHT

	// HOOKS

	// HANDLERS
	const handleToggle = async (e: React.MouseEvent) => {
		e.stopPropagation()
		const w = drawerSo.state.lastWidth < 20 ? 500 : drawerSo.state.lastWidth
		drawerSo.state.animation = true
		drawerSo.setWidth(drawerSo.state.width > 0 ? 0 : w)
		await delay(400)
		drawerSo.state.animation = false
	}
	const handleCompressAll = (e: React.MouseEvent) => {
		e.stopPropagation()
		forEachViews(drawerSo.state.all, view => view.setSize(VIEW_SIZE.COMPACT))
	}
	const handleMenuPosition = (e: React.MouseEvent) => {
		e.stopPropagation()
		docsSo.setDrawerPosition(inRight ? DRAWER_POSITION.BOTTOM : DRAWER_POSITION.RIGHT)
	}
	const handleDragMove = (pos: number, diff: number) => {
		drawerSo.setWidth(pos + diff); drawerSo.state.lastWidth = pos + diff;
	}

	// RENDER
	const size = drawerSa.all?.length ?? 0
	const clsRoot = `${cls.root} ${cls[docsSa.drawerPosition]}`
	const styleContainer = inRight ? { width: drawerSa.width } : { height: drawerSa.width }

	return (
		<div className={clsRoot} >

			<ResizerCmp
				direction={inRight ? RESIZER_DIRECTION.HORIZONTAL : RESIZER_DIRECTION.VERTICAL}
				className={cls.handle}
				onStart={(pos: number) => drawerSo.state.width}
				onMove={handleDragMove}
			>
				<IconButton className={cls.btt}
					onClick={handleToggle}
				>
					{drawerSa.width > 0
						? (inRight ? <DirectionRightIcon /> : <DirectionDownIcon />)
						: (inRight ? <DirectionLeftIcon /> : <DirectionUpIcon />)
					}
				</IconButton>

				<IconButton className={cls.btt}
					onClick={handleCompressAll}
				>
					<CompressAllIcon />
				</IconButton>

				<IconButton className={cls.btt}
					onClick={handleMenuPosition}
				>
					{inRight ? <MenuBottomIcon /> : <MenuRightIcon />}
				</IconButton>

				<div className="jack-bars-alert-bg" draggable={false} style={{ flex: 1, userSelect: "none" }} />
				<div className={cls.handle_label} draggable={false}>DRAWER</div>
				<div className="jack-bars-alert-bg" draggable={false} style={{ flex: 1, userSelect: "none" }} />

				<div className={cls.size}>
					{size}
				</div>

			</ResizerCmp>

			<div
				className={`${cls.handle_container} ${drawerSa.animation ? cls.animate : ""}`}
				style={styleContainer}
			>
				<CardsGroup 
					cardsStore={drawerSo} 
					Render={PolymorphicCard}
				/>
			</div>

		</div>
	)
}

export default DrawerGroup
