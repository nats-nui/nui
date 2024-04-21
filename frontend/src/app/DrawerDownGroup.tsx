import IconButton from "@/components/buttons/IconButton"
import CompressAllIcon from "@/icons/CompressAllIcon"
import DirectionLeftIcon from "@/icons/DirectionLeftIcon"
import DirectionRightIcon from "@/icons/DirectionRightIcon"
import { drawerCardsSo as drawerSo } from "@/stores/docs/cards"
import { forEachViews } from "@/stores/docs/utils/manage"
import { VIEW_SIZE } from "@/stores/stacks/utils"
import { delay } from "@/utils/time"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import CardsGroup from "./CardsGroups"
import cls from "./DrawerDownGroup.module.css"
import DirectionUpIcon from "@/icons/DirectionUpIcon"
import DirectionDownIcon from "@/icons/DirectionDownIcon"
import MenuRightIcon from "@/icons/MenuRightIcon"
import docsSo, { DRAWER_POSITION } from "@/stores/docs"



const DrawerDownGroup: FunctionComponent = () => {

	// STORES
	const drawerSa = useStore(drawerSo)

	// HOOKS

	// HANDLERS
	const handleDown = (e: React.MouseEvent) => {
		drawerSa.isDown = true
		drawerSa.startX = e.clientY;
		drawerSa.startWidth = drawerSa.width;
		const mouseMove = (ev: MouseEvent) => {
			if (!drawerSa.isDown) return
			const currentX = ev.clientY;
			const diffX = drawerSa.startX - currentX;
			drawerSa.lastWidth = drawerSa.startWidth + diffX
			drawerSo.setWidth(drawerSa.lastWidth)
		}
		const mouseUp = (ev: MouseEvent) => {
			drawerSa.isDown = false
			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mouseup', mouseUp);
		}
		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mouseup', mouseUp);
	}
	const handleToggle = async (e: React.MouseEvent) => {
		const w = drawerSa.lastWidth < 20 ? 500 : drawerSa.lastWidth

		drawerSo.state.animation = true
		drawerSo.setWidth(drawerSa.width > 0 ? 0 : w)
		await delay(400)
		drawerSo.state.animation = false
	}
	const handleCompressAll = (e: React.MouseEvent) => {
		forEachViews(drawerSo.state.all, view => view.setSize(VIEW_SIZE.COMPACT))
	}
	const handleMenuRight = (e: React.MouseEvent) => {
		docsSo.setDrawerPosition(DRAWER_POSITION.RIGHT)
	}

	

	// RENDER
	const size = drawerSa.all?.length ?? 0

	return (
		<div className={cls.root} >

			{/* HANDLE */}
			<div className={cls.handle}
				draggable={false}
				onMouseDown={handleDown}
			>
				<IconButton className={cls.btt}
					onClick={handleToggle}
				>
					{drawerSa.width > 0 ? <DirectionDownIcon/> : <DirectionUpIcon/>}
				</IconButton>

				<IconButton className={cls.btt}
					onClick={handleCompressAll}
				>
					<CompressAllIcon />
				</IconButton>

				<IconButton className={cls.btt}
					onClick={handleMenuRight}
				>
					<MenuRightIcon />
				</IconButton>

				<div className="bars-alert-bg-1" draggable={false} style={{ flex: 1, userSelect: "none" }} />
				<div className={cls.handle_label} draggable={false}>DRAWER</div>
				<div className="bars-alert-bg-1" draggable={false} style={{ flex: 1, userSelect: "none" }} />

				<div className={cls.size}>
					{size}
				</div>
			</div>

			{/* CARDS */}
			<div
				className={`${cls.handle_container} ${drawerSa.animation ? cls.animate : ""}`}
				style={{ height: drawerSa.width }}
			>
				<CardsGroup cardsStore={drawerSo} />
			</div>

		</div>
	)
}

export default DrawerDownGroup
