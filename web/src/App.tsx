import docSo, { DRAG_ZONE, DocState } from "@/stores/docs"
import { useStore } from "@priolo/jon"
import { DragEvent, FunctionComponent } from "react"
import DocViewCmp from "./components/DocViewCmp"
import MainMenu from "./components/MainMenu"
import { getID } from "./stores/docs/utils"
import { ViewStore } from "./stores/docs/docBase"



const App: FunctionComponent = () => {

	// STORES
	const docSa = useStore(docSo) as DocState

	// HANDLERS
	const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
		e.preventDefault()
		if (docSa.drag?.srcView == null) return
		docSo.setDrag({
			...docSa.drag,
			crrView: null,
			zone: DRAG_ZONE.LAST,
			index,
		})
	}
	// const handleDragOver2: React.DragEventHandler = (e) => {
	// 	e.preventDefault()
	// 	docSo.setDrag({
	// 		...docSa.drag,
	// 		crrView: null,
	// 		zone: DRAG_ZONE.FIRST,
	// 	})
	// }
	const handleDragLeave = () => {
		docSo.setDrag({
			...docSa.drag,
			crrView: null,
			zone: DRAG_ZONE.NONE,
			index: null,
		})
	}
	const handleDrop = () => {
		if (docSa.drag?.srcView == null) return
		docSo.drop()
	}



	// RENDER
	const views = docSa.all
	return (
		<div style={cssApp}>
			<MainMenu />
			<div style={cssContent}>
				<div style={cssDroppable(false)} draggable={false}
					onDragOver={(e) => handleDragOver(e, 0)}
					onDragLeave={handleDragLeave}
					//onDragEnd={handleDragEnd}
					onDrop={handleDrop}
				/>
				{views.map((view: ViewStore, index: number) =>
					<div style={{ display: "flex", zIndex: views.length - index }} key={index/*getID(view)*/}>

						<DocViewCmp view={view} />
						<div style={cssDroppable(index == views.length - 1)} draggable={false}
							onDragOver={(e) => handleDragOver(e, index + 1)}
							onDragLeave={handleDragLeave}
							//onDragEnd={handleDragEnd}
							onDrop={handleDrop}
						/>

					</div>
				)}
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
	//gap: "5px",
}

const cssDroppable = (last: boolean): React.CSSProperties => ({
	width: last ? "200px" : "35px",
	backgroundColor: "green",
})