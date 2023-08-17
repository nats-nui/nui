import docSo, { DRAG_ZONE, DocState } from "@/stores/docs"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import DocViewCmp from "./components/DocViewCmp"
import MainMenu from "./components/MainMenu"
import { getID } from "./stores/docs/utils"
import { ViewStore } from "./stores/docs/doc"



const App: FunctionComponent = () => {

	// STORES
	const docSa = useStore(docSo) as DocState

	// HANDLERS
	const handleDragOver: React.DragEventHandler = (e) => {
		e.preventDefault()
		docSo.setDrag({
			...docSa.drag,
			crrView: null,
			zone: DRAG_ZONE.LAST,
		})
	}
	const handleDragOver2: React.DragEventHandler = (e) => {
		e.preventDefault()
		docSo.setDrag({
			...docSa.drag,
			crrView: null,
			zone: DRAG_ZONE.FIRST,
		})
	}
	const handleDragLeave = (e) => {
		console.log("leave")
		docSo.setDrag({
			...docSa.drag,
			crrView: null,
			zone: DRAG_ZONE.NONE,
		})
	}
	const handleDrop = (e) => {
		docSo.drop()
	}



	// RENDER
	const views = docSa.all
	return (
		<div style={cssApp}>
			<MainMenu />
			<div style={cssContent}>
				<div style={cssDroppable}
					onDragOver={handleDragOver2}
					onDragLeave={handleDragLeave}
					//onDragEnd={handleDragEnd}
					onDrop={handleDrop}
				/>
				{views.map((view: ViewStore) =>
					<DocViewCmp key={getID(view)} view={view} />
				)}
				<div style={cssDroppable}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					//onDragEnd={handleDragEnd}
					onDrop={handleDrop}
				/>
			</div>
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
	gap: "5px",
}

const cssDroppable: React.CSSProperties = {
	width: "100px",
	backgroundColor: "green",
}