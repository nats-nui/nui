import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { RenderRowBaseProps } from "./EditList"



const EditStringRow: FunctionComponent<RenderRowBaseProps<string>> = ({
	item,
	focus,
	onChange,
	onDelete,
	onFocus,
}) => {

	// HOOKS
	const [enter, setEnter] = useState(false)
	const inputRef = useRef(null);
	useEffect(() => {
		if (focus) inputRef.current?.select()
	}, [focus])

	// HANDLER
	const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
		const newItem = e.target.value
		onChange?.(newItem)
	}
	const handleEnter = () => setEnter(true)
	const handleLeave = () => setEnter(false)
	const handleFocus = () => onFocus?.()
	const handleDelete = () => onDelete?.()
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		switch (event.key) {
			case "Delete":
			case "Backspace":
				if ( item?.length>0 ) return
				event.preventDefault()
				onDelete?.()
				break
		}
	}

	// RENDER
	const delVisible = enter

	return <div
		style={cssRow}
		onMouseEnter={handleEnter}
		onMouseLeave={handleLeave}
		
	>

		<input style={cssInput}
			type="text"
			ref={inputRef}
			value={item}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
		/>

		{delVisible && (
			<IconButton
				onClick={handleDelete}
			><CloseIcon /></IconButton>
		)}
	</div>
}

export default EditStringRow

const cssRow: React.CSSProperties = {
	minHeight: 24,
	display: "flex",
	alignItems: "center",
}

const cssInput: React.CSSProperties = {
	minWidth: 50,
	backgroundColor: 'transparent',
	border: 'none',
	color: "currentcolor",

	fontSize: 14,
	fontWeight: 600,
}