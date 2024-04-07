//import srcBg from "@/assets/bg4.jpg"
import { FunctionComponent } from "react"
import cls from "./App.module.css"
import Deck from "./Deck"
import DrawerCmp from "./DrawerCmp"
import DragCmp from "./components/DragCmp"
import TooltipCmp from "./components/TooltipCmp"
import MainMenu from "./components/mainMenu/MainMenu"



const App: FunctionComponent = () => {

	// STORES
	
	// HOOKS

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>

			<MainMenu />

			<div className={cls.content}>
				<Deck />
				<DrawerCmp />
			</div>

			<DragCmp />
			<TooltipCmp />
		</div>
	)
}

export default App
