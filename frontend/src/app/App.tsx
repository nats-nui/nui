//import srcBg from "@/assets/bg4.jpg"
import MainMenu from "@/app/mainMenu/MainMenu"
import docsSo from "@/stores/docs"
import { ProtobufSchemaProvider } from "@/contexts/ProtobufSchemaContext"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import cls from "./App.module.css"
import DeckGroup from "./DeckGroup"
import DrawerGroup from "./DrawerGroup"
import ZenCard from "./ZenCard"
import { TooltipCmp, DragCmp } from "@priolo/jack"
import layoutSo from "@/stores/layout"



const App: FunctionComponent = () => {

	// STORES
	const docsSa = useStore(docsSo)
	useStore(layoutSo)

	// HOOKS

	// HANDLERS

	// RENDER
	const clsContent = `${cls.content} ${cls[docsSa.drawerPosition]}`

	return (
		<ProtobufSchemaProvider>
			<div className={`${cls.root} ${cls[layoutSo.state.theme]}`}>

				<ZenCard />

				<MainMenu />

				<div className={clsContent}>
					<DeckGroup />
					<DrawerGroup />
				</div>

				<DragCmp />
				<TooltipCmp />
			</div>
		</ProtobufSchemaProvider>
	)
}

export default App
