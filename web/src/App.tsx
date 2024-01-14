import docSo, { DocState } from "@/stores/docs"
import layoutSo, { LayoutState } from "@/stores/layout"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import CardCmp from "./CardCmp"
import DragCmp from "./components/DragCmp"
import MainMenu from "./components/MainMenu"
import TooltipCmp from "./components/TooltipCmp"
import { getID } from "./stores/docs/utils/factory"
import { Theme } from "./stores/layout/utils"
import srcBg from "@/assets/bg1.jpg"



const App: FunctionComponent = () => {

	// STORES
	const layoutSa: LayoutState = useStore(layoutSo)
	const docSa: DocState = useStore(docSo)

	// HOOKS
	const [storesAnchored, stores] = useMemo(()=>[
		docSo.getAnchored(),
		docSo.getVisible(),
	],[docSa.all, docSa.anchored])

	// HANDLERS

	// RENDER
	return (
		<div style={cssApp(layoutSa.theme)}>

			<MainMenu />

			<div style={cssContent}>

				<div style={cssFixed}>
					{storesAnchored.map((store: ViewStore) =>
						<CardCmp key={getID(store.state)}
							store={store}
						/>
					)}
					{/* <DropArea index={-1} /> */}
				</div>

				<div style={{ zIndex: 0, display: "flex", flex: 1 }}>
					{stores.map((store: ViewStore) =>
						<CardCmp key={getID(store.state)}
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

const cssApp = (theme: Theme): React.CSSProperties => ({
	position: "relative",
	height: "100%",
	display: "flex",
	backgroundColor: "black",
	color: theme.palette.default.fg,
	backgroundImage: `url("${srcBg}")`,
	backgroundRepeat: "repeat-x",
})

const cssContent: React.CSSProperties = {
	flex: 1,
	display: "flex",
	overflowX: "auto",
	padding: "10px 0px 10px 0px",
}

const cssFixed: React.CSSProperties = {
	zIndex: 1, 
	display: "flex", 
	position: "sticky", 
	left: 0, right: 0, 
	backgroundColor: "rgb(0 0 0 / 100%)", 
	//margin: "-10px 10px -10px 0px", 
	//padding: "10px 0px", 
	paddingRight: 20,
	borderRight: "2px dashed white",
}
