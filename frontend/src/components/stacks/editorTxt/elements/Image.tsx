import { ElementImage } from "@/stores/stacks/editor/utils/types";
import { useStore } from "@priolo/jon";
import { FunctionComponent, useRef } from 'react';
import { Transforms } from "slate";
import { RenderElementProps, useFocused, useSelected } from "slate-react";
import cls from "./Image.module.css";
import IconButton from "@/components/buttons/IconButton";



interface Props extends RenderElementProps {
	element: ElementImage
} 

const ImageCmp: FunctionComponent<Props> = ({
	attributes, 
	element,
	children, 
}) =>{

	// HOOKs
	const store = getElementStore(doc.identity)
	const docNs = useStore(store)
	const { getPathFromElement, modifyNode } = store
	const selected = useSelected()
	const focused = useFocused()
	const inputRef = useRef(null) // input file


	// HANDLERs
	const handleClickPlaceholder = e => {
		inputRef.current.click()
	}
	const handleClickImg = e => {
		const path = getPathFromElement(element)
		Transforms.select(docNs.editor, path)
	}
	const handleRemoveImg = e => {
		modifyNode({ element, props: { url: null } })
	}
	const handleChangeFile = async (e) => {
		const [file] = e.target.files
		inputRef.current.value = ""
		let urlData = await urlDataFromFile(file)
		urlData = await urlDataResize(urlData)
		modifyNode({ element, props: { url: urlData } })
	}


	// RENDER
	if (!docNs) return null
	const cnImage = `${cls.image} ${selected && focused ? cls.focus : ''}`
	const cnRoot = `${cls.root} ${selected && focused ? cls.focus : ''}`
	const haveUrl = element.url && element.url.length > 0

	return (
		<div className={cnRoot} {...attributes}>

			{haveUrl ? (<>
				<IconButton onClick={handleRemoveImg}>
					B
				</IconButton>
				<img
					contentEditable={false}
					className={cnImage}
					src={element.url}
					onClick={handleClickImg}
				/>
			</>) : (<>
				<div
					contentEditable={false}
					className={cls.placeholder}
					onClick={handleClickPlaceholder}
				>CLICCA QUA O DRAGGA IMMAGINE</div>
				<input
					ref={inputRef}
					type="file"
					//multiple="!singleFile"
					style={{ display: "none" }}
					onChange={handleChangeFile}
				/>
			</>)}

			<div className={cls.description}>{children}</div>

		</div>
	)
}

export default ImageCmp