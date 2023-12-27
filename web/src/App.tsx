import docSo, { DocState } from "@/stores/docs"
import layoutSo, { LayoutState } from "@/stores/layout"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import CardCmp from "./CardCmp"
import DragCmp from "./components/DragCmp"
import MainMenu from "./components/MainMenu"
import { getID } from "./stores/docs/utils/factory"
import { Theme } from "./stores/layout/utils"



const App: FunctionComponent = () => {

	// STORES
	const layoutSa: LayoutState = useStore(layoutSo)
	const docSa: DocState = useStore(docSo)

	// HOOKS

	// HANDLERS

	// RENDER
	const storesAnchored = docSa.all.slice(0, docSa.anchored)
	const stores = docSa.all.slice(docSa.anchored)
	return (
		<div style={cssApp(layoutSa.theme)}>

			{/* <MainMenu /> */}

			<div style={cssContent}>

				<div style={{ zIndex: 1, display: "flex", position: "sticky", left: 0, right: 0, backgroundColor: "rgb(0 0 0 / 100%)", margin: "-10px 10px -10px 0px", padding: "10px 0px", borderRight: "2px dashed white", }}>
					{storesAnchored.map((store: ViewStore) =>
						<CardCmp key={getID(store.state)}
							store={store}
						/>
					)}
				</div>

				<div style={{ zIndex: 0, display: "flex" }}>
					{stores.map((store: ViewStore) =>
						<CardCmp key={getID(store.state)}
							store={store}
						/>
					)}
				</div>
			</div>

			<DragCmp />

		</div>
	)
}

export default App

const cssApp = (theme: Theme): React.CSSProperties => ({
	height: "100%",
	display: "flex",
	backgroundColor: "black",
	color: theme.palette.default.fg,
})

const cssContent: React.CSSProperties = {
	flex: 1,
	display: "flex",
	overflowX: "auto",
	padding: "10px 0px 10px 0px"
}


