import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { RenderRowBaseProps } from "../lists/EditList"



const EditStringRow: FunctionComponent<RenderRowBaseProps<string>> = ({
	item,
	focus,
	onChange,
	onDelete,
	onFocus,
}) => {

	useEffect(() => {
		if (focus) {
			inputRef.current?.select()
		} else {
			if (isVoid(item)) onDelete?.()
		}
	}, [focus])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newItem = e.target.value
		onChange?.(newItem)
	}
	
	// ******************

	// HOOKS
	const [enter, setEnter] = useState(false)
	const inputRef = useRef(null);

	// HANDLER

	const handleEnter = () => setEnter(true)
	const handleLeave = () => setEnter(false)
	const handleFocus = () => {
		inputRef.current?.select()
		onFocus?.()
	}
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.key == "Delete" || event.key == "Backspace") && isVoid(item)) {
			event.preventDefault()
			onDelete?.()
		}
	}

	// ******************

	const handleDelete = () => onDelete?.()


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

const isVoid = (item: string) => !item || item.trim().length == 0

const cssRow: React.CSSProperties = {
	minHeight: 24,
	display: "flex",
	alignItems: "center",
}

const cssInput: React.CSSProperties = {
	flex: 1,
}