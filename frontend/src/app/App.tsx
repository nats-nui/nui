//import srcBg from "@/assets/bg4.jpg"
import { FunctionComponent } from "react"
import cls from "./App.module.css"
import DeckGroup from "./DeckGroup"
import DrawerGroup from "./DrawerGroup"
import DragCmp from "@/components/DragCmp"
import TooltipCmp from "@/components/tooltip/TooltipCmp"
import MainMenu from "@/app/mainMenu/MainMenu"
import DrawerDownGroup from "./DrawerDownGroup"
import docsSo, { DRAWER_POSITION } from "@/stores/docs"
import { useStore } from "@priolo/jon"



const App: FunctionComponent = () => {

	// STORES
	const docsSa = useStore(docsSo)

	// HOOKS

	// HANDLERS

	// RENDER
	const clsContent = `${cls.content} ${cls[docsSa.drawerPosition]}`

	return (
		<div className={cls.root}>

			<MainMenu />

			<div className={clsContent}>
				<DeckGroup />
				{docsSa.drawerPosition == DRAWER_POSITION.BOTTOM ? <DrawerDownGroup /> : <DrawerGroup />}
			</div>

			<DragCmp />
			<TooltipCmp />
		</div>
	)
}

export default App
