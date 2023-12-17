import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/docs/viewBase"
import layoutSo, { LayoutState } from "@/stores/layout"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import DocViewCmp from "./components/DocViewCmp"
import DragCmp from "./components/DragCmp"
import DropArea from "./components/DropArea"
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
	const views = docSa.all
	return (
		<div style={cssApp(layoutSa.theme)}>

			<MainMenu />

			<div style={cssContent}>

				<DropArea index={0} />

				{views.map((view: ViewStore, index: number) =>
					<div key={getID(view.state)} style={cssCol(views.length, index)}>
						<DocViewCmp view={view} />
						<DropArea
							index={index + 1}
							isLast={index == views.length - 1}
							viewSo={view}
						/>
					</div>
				)}
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

const cssCol = (length: number, index: number) => ({
	display: "flex",
	zIndex: length - index,
	flex: index == length - 1 ? 1 : null
})

const cssContent: React.CSSProperties = {
	flex: 1,
	display: "flex",
	overflowX: "auto",
	padding: "10px 0px 10px 5px"
}
