import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import cls from "./App.module.css"
import DragCmp from "./components/DragCmp"
import TooltipCmp from "./components/TooltipCmp"
import CardCmp from "./components/cards/CardCmp"
import MainMenu from "./components/mainMenu/MainMenu"



const App: FunctionComponent = () => {

	// STORES
	const docSa: DocState = useStore(docSo)

	// HOOKS
	const [storesAnchored, stores] = useMemo(() => [
		docSo.getAnchored(),
		docSo.getVisible(),
	], [docSa.all, docSa.anchored])

	// HANDLERS

	// RENDER
	return (
		<div className={cls.root}>

			<MainMenu />

			<div className={cls.content}>

				<div className={cls.fixed}>
					{storesAnchored.map((store: ViewStore) =>
						<CardCmp key={store.state.uuid}
							store={store}
						/>
					)}
					{/* <DropArea index={-1} /> */}
				</div>

				<div className={cls.visible}>
					{stores.map((store: ViewStore) =>
						<CardCmp key={store.state.uuid}
							store={store}
						/>
					)}
				</div>
			</div>

			<DragCmp />
			<TooltipCmp />

		</div>
	)
}

export default App
