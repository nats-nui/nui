//import srcBg from "@/assets/bg4.jpg"
import { FunctionComponent } from "react"
import cls from "./App.module.css"
import DeckGroup from "./DeckGroup"
import DrawerGroup from "./DrawerGroup"
import DragCmp from "@/components/DragCmp"
import TooltipCmp from "@/components/TooltipCmp"
import MainMenu from "@/app/mainMenu/MainMenu"



const App: FunctionComponent = () => {

	// STORES
	
	// HOOKS

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>

			<MainMenu />

			<div className={cls.content}>
				<DeckGroup />
				<DrawerGroup />
			</div>

			<DragCmp />
			<TooltipCmp />
		</div>
	)
}

export default App
