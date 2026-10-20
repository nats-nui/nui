import MainMenu from "@/app/mainMenu/MainMenu"
import { ProtobufSchemaProvider } from "@/contexts/ProtobufSchemaContext"
import cddlSo from "@/stores/cddl"
import docsSo from "@/stores/docs"
import { DragCmp, TooltipCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import cls from "./App.module.css"
import DeckGroup from "./DeckGroup"
import DrawerGroup from "./DrawerGroup"
import ZenCard from "./ZenCard"



const App: FunctionComponent = () => {

	// STORES
	const docsSa = useStore(docsSo)

	// HOOKS
	useEffect(() => {
		cddlSo.load()
	}, [])

	// HANDLERS

	// RENDER
	const clsContent = `${cls.content} ${cls[docsSa.drawerPosition]}`

	return (
		<ProtobufSchemaProvider>
			<div id="main-panel" className={cls.root}>

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
