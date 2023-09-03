import cnnSo from "@/stores/connections"
import docSo, { DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/docs/docBase"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import DropArea from "./DropArea"
import DocViewCmp from "./components/DocViewCmp"
import MainMenu from "./components/MainMenu"
import DragCmp from "./DragCmp"
import { getID } from "./stores/docs/utils/factory"



const App: FunctionComponent = () => {

	// STORES
	const docSa = useStore(docSo) as DocState

	// HOOKS
	useEffect(() => {
		cnnSo.fetch()
	}, [])

	// HANDLERS
	

	// RENDER
	const views = docSa.all
	return (
		<div style={cssApp}>
			
			<MainMenu />
			<div style={cssContent}>

				<DropArea index={0} />

				{views.map((view: ViewStore, index: number) =>
					<div style={{ display: "flex", zIndex: views.length - index }} key={getID(view.state)}>
						<DocViewCmp view={view} />
						<DropArea index={index + 1} />
					</div>
				)}
			</div>

			<DragCmp />
			
		</div>
	)
}

export default App

const cssApp: React.CSSProperties = {
	height: "100%",
	display: "flex",
	backgroundColor: "black",
}

const cssContent: React.CSSProperties = {
	flex: 1,
	display: "flex",
	//gap: "5px",
}
