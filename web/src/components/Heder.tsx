import imgCnn from "@/assets/cnn-hdr.svg"
import imgMsg from "@/assets/msg-hdr.svg"
import docSo, { DRAG_ZONE, DocState } from "@/stores/docs"
import { ViewStore } from "@/stores/docs/doc"
import { DOC_TYPE } from "@/types/Doc"
import { useStore } from "@priolo/jon"
import React, { FunctionComponent } from "react"
import CloseBtt from "./buttons/CloseBtt"



interface Props {
	view?: ViewStore
}

const Header: FunctionComponent<Props> = ({
	view,
}) => {
	// STORE
	const docSa = useStore(docSo) as DocState

	// HOOK

	// HANDLER
	const handleClose = _ => {
		docSo.remove(view)
	}

	const handleDragStart: React.DragEventHandler = (e) => {
		e.dataTransfer.effectAllowed = 'move';
		//e.dataTransfer.setData('text/html', "document");
		e.dataTransfer.setDragImage(e.target["parentNode"], 20, 20);
		docSo.setDrag({
			srcView: view,
			zone: DRAG_ZONE.NONE
		})
		console.log("drag start", view)
	}
	const handleDragOver: React.DragEventHandler = (e) => {
		e.preventDefault();
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		e.dataTransfer.dropEffect = "move";
		const width = rect.width
		let zone = DRAG_ZONE.NONE
		if (x < (width / 3)) {
			zone = DRAG_ZONE.LEFT
		} else if (x > (width / 3) && x < (width * 2 / 3)) {
			zone = DRAG_ZONE.CENTER
		} else if (x > (width * 2 / 3)) {
			zone = DRAG_ZONE.RIGHT
		}
		docSo.setDrag({
			...docSa.drag,
			crrView: view,
			zone
		})
		console.log("drag over")
	}

	const handleDrop = (e) => {
		docSo.drop(view)
		console.log("drag drop")
	}

	const handleDragLeave = (e) => {
		console.log("leave")
		docSo.setDrag({
			...docSa.drag,
			crrView: null,
			zone: DRAG_ZONE.NONE,
		})
	}

	const handleClick = (e) => {
		docSo.showStack(view)
	}


	// RENDER
	const doc = view
	if (!doc) return null
	const isDragLeft = view == docSa.drag?.crrView && docSa.drag?.zone == DRAG_ZONE.LEFT

	const isDragRight = view == docSa.drag?.crrView && docSa.drag?.zone == DRAG_ZONE.RIGHT
	const isDragCenter = view == docSa.drag?.crrView && docSa.drag?.zone == DRAG_ZONE.CENTER
	const isDraggable = true //doc.position == POSITION_TYPE.DETACHED
	const isDroppable = docSa.drag?.srcView != view

	const title = { 
		[DOC_TYPE.CONNECTIONS]: "CONNECTIONS", 
		[DOC_TYPE.SERVICES]: "SERVICES",
		[DOC_TYPE.MESSAGES]: "MESSAGES",
	}[doc.state.type]

	const icon = {
		[DOC_TYPE.CONNECTIONS]: <img style={cssImg} src={imgCnn} />,
		[DOC_TYPE.MESSAGES]: <img style={cssImg} src={imgMsg} />,
	}[view.state.type]

	let styleTitle = isDragCenter ? cssTitleDragOver : cssTitle
	styleTitle = {
		...styleTitle,
		margin: icon ? "0px 11px 0px 37px" : "0px 11px 0px 11px",
	}

	return (
		<div style={cssContainer}
			// onDragOver={isDroppable ? handleDragOver : null}
			// onDragLeave={isDroppable ? handleDragLeave : null}
			// //onDragEnd={handleDragEnd}
			// onDrop={isDroppable ? handleDrop : null}
		>
			{/* {isDragLeft && <div style={cssPlaceholder} />} */}

			{icon}

			<div style={styleTitle}
				draggable
				onDragStart={handleDragStart}
				onClick={handleClick}
			>
				<span style={cssLabel}>{title}</span>
				<CloseBtt onClick={handleClose} />
			</div>

			{/* {isDragRight && <div style={cssPlaceholder} />} */}
		</div>
	)
}

export default Header

const cssContainer: React.CSSProperties = {
	display: "flex",
	position: "relative",
	alignItems: "start",
	height: "48px",

}

const cssImg: React.CSSProperties = {
	position: "absolute",
	left: 0, top: 0,
}

const cssTitle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	flex: 1,
	zIndex: 0,
}
const cssTitleDragOver: React.CSSProperties = {
	...cssTitle,
	backgroundColor: "black"
}
const cssLabel: React.CSSProperties = {
	flex: 1,
	fontFamily: "Darker Grotesque",
	fontSize: "22px",
	fontWeight: 800,
	color: "#FFF",
	overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
}




const cssPlaceholder: React.CSSProperties = {
	width: "20px", height: "20px",
	backgroundColor: "black"
}