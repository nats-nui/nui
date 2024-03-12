import srcBg from "@/assets/bg4.jpg"
import docSo, { DocState } from "@/stores/docs"
import layoutSo, { LayoutState } from "@/stores/layout"
import { ViewStore } from "@/stores/stacks/viewBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import CardCmp from "./components/cards/CardCmp"
import DragCmp from "./components/DragCmp"
import TooltipCmp from "./components/TooltipCmp"
import MainMenu from "./components/mainMenu/MainMenu"
import { Theme } from "./stores/layout/utils"



const App: FunctionComponent = () => {

	// STORES
	const layoutSa: LayoutState = useStore(layoutSo)
	const docSa: DocState = useStore(docSo)

	// HOOKS
	const [storesAnchored, stores] = useMemo(() => [
		docSo.getAnchored(),
		docSo.getVisible(),
	], [docSa.all, docSa.anchored])

	// HANDLERS

	// RENDER
	return (
		<div style={cssApp(layoutSa.theme)}>

			<MainMenu />

			<div style={cssContent}>

				<div style={cssFixed}>
					{storesAnchored.map((store: ViewStore) =>
						<CardCmp key={store.state.uuid}
							store={store}
						/>
					)}
					{/* <DropArea index={-1} /> */}
				</div>

				<div style={cssVisible}>
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

const cssApp = (theme: Theme): React.CSSProperties => ({
	position: "relative",
	height: "100%",
	display: "flex",

	color: theme.palette.default.fg,
	//backgroundColor: "#333333",

	backgroundImage: `url("${srcBg}")`,
	backgroundColor: "rgba(0, 0, 0, 0.8)",
	backgroundBlendMode: "darken",
	// backgroundSize: "100% 100%",
	//backgroundRepeat: "repeat-x",
})

const cssContent: React.CSSProperties = {
	flex: 1,
	display: "flex",
	overflowX: "auto",
}

const cssFixed: React.CSSProperties = {
	zIndex: 1,
	display: "flex",
	position: "sticky",
	left: 0, right: 0,
	backgroundColor: "#636363",
	padding: "10px 25px 10px 0px",
	//borderRight: "2px dashed white",
}

const cssVisible: React.CSSProperties = {
	zIndex: 0, display: "flex", flex: 1,
	padding: "10px 0px 10px 0px",
}
