import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/docs/viewBase"
import layoutSo, { LayoutState } from "@/stores/layout"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import DragCmp from "./DragCmp"
import DropArea from "./DropArea"
import DocViewCmp from "./components/DocViewCmp"
import MainMenu from "./components/MainMenu"
import { getID } from "./stores/docs/utils/factory"
import { Theme } from "./stores/layout/utils"
import { DOC_ANIM } from "./types"



const App: FunctionComponent = () => {

	// STORES
	const layoutSa: LayoutState = useStore(layoutSo)
	const docSa: DocState = useStore(docSo)


	// HOOKS

	// HANDLERS

	// RENDER
	const views = docSa.allInShow
	return (
		<div style={cssApp(layoutSa.theme)}>

			<MainMenu />
			<div style={cssContent}>

				<DropArea index={0} />

				{views.map((view: ViewStore, index: number) =>
					<div style={{ display: "flex", zIndex: views.length - index }} key={getID(view.state)}>
						<DocViewCmp view={view} />
						<DropArea index={index + 1}
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
	color: theme.palette.fg.default,
})

const cssContent: React.CSSProperties = {
	flex: 1,
	display: "flex",
	//gap: "5px",
}
