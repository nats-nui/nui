import styles from "./Image.module.css"
import { useRef } from 'react';
import { ReactEditor, useFocused, useSelected } from "slate-react"
import { Transforms } from "slate";
import ButtonIcon from "/src/components/app/ButtonIcon";
import BoldIcon from "/src/imeges/icons/BoldIcon";
import { urlDataFromFile, urlDataResize } from "/src/store/doc/withImages";
import { useStore } from "@priolo/jon";
import { getElementStore } from "/src/store/doc";


export default function ImageCmp({
	attributes, 
	element,
	doc,
	children, 
}) {

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
	const cnImage = `${styles.image} ${selected && focused ? styles.focus : ''}`
	const cnRoot = `${styles.root} ${selected && focused ? styles.focus : ''}`
	const haveUrl = element.url && element.url.length > 0

	return (
		<div className={cnRoot} {...attributes}>

			{haveUrl ? (<>
				<ButtonIcon onClick={handleRemoveImg}>
					<BoldIcon />
				</ButtonIcon>
				<img
					contentEditable={false}
					className={cnImage}
					src={element.url}
					onClick={handleClickImg}
				/>
			</>) : (<>
				<div
					contentEditable={false}
					className={styles.placeholder}
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

			<div className={styles.description}>{children}</div>

		</div>
	)
}