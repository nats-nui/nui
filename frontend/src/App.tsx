//import srcBg from "@/assets/bg4.jpg"
import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo, useState } from "react"
import cls from "./App.module.css"
import DrawerCmp from "./DrawerCmp"
import DragCmp from "./components/DragCmp"
import TooltipCmp from "./components/TooltipCmp"
import CardCmp from "./components/cards/CardCmp"
import MainMenu from "./components/mainMenu/MainMenu"



const App: FunctionComponent = () => {

	// STORES
	const docSa: DocState = useStore(docSo)

	// HOOKS
	const stores = useMemo(() => docSo.getVisible(), [docSa.all, docSa.anchored])

	const [exp, setExp] = useState(true)

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>

			<MainMenu />

			<div className={cls.content}>

				<div className={cls.visible}>
					{stores.map((store: ViewStore) =>
						<CardCmp key={store.state.uuid}
							store={store}
						/>
					)}
				</div>

				<DrawerCmp />

			</div>

			<DragCmp />

			<TooltipCmp />

		</div>
	)
}

export default App

const cssFixed = (exp: boolean): React.CSSProperties => ({
	display: "flex",
	width: exp ? 500 : 0,
	transition: "width 300ms",
})