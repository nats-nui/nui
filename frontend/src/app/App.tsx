//import srcBg from "@/assets/bg4.jpg"
import MainMenu from "@/app/mainMenu/MainMenu"
import DragCmp from "@/components/DragCmp"
import docsSo from "@/stores/docs"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./App.module.css"
import DeckGroup from "./DeckGroup"
import DrawerGroup from "./DrawerGroup"
import ZenCard from "./ZenCard"
import { TooltipCmp } from "@priolo/jack"



const App: FunctionComponent = () => {

	// STORES
	const docsSa = useStore(docsSo)

	// HOOKS

	// HANDLERS

	// RENDER
	const clsContent = `${cls.content} ${cls[docsSa.drawerPosition]}`

	return (
		<div className={cls.root}>

			<ZenCard />

			<MainMenu />

			<div className={clsContent}>
				<DeckGroup />
				<DrawerGroup />
			</div>

			<DragCmp />
			<TooltipCmp />
		</div>
	)
}

export default App
