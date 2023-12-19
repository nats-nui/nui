import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { RenderRowBaseProps } from "./EditList"
import { Auth } from "@/types"



const EditAuthRow: FunctionComponent<RenderRowBaseProps<Auth>> = ({
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
		if (focus) {
			inputRef.current?.select()
		} else {
			if ( item != null ) return
			onDelete?.()
		}
	}, [focus])

	// HANDLER
	const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
		const newItem = e.target.value
		onChange?.(newItem)
	}
	const handleEnter = () => setEnter(true)
	const handleLeave = () => setEnter(false)
	const handleFocus = () => {
		inputRef.current?.select()
		onFocus?.()
	}
	
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

export default EditAuthRow

const cssRow: React.CSSProperties = {
	minHeight: 24,
	display: "flex",
	alignItems: "center",
}

const cssInput: React.CSSProperties = {
	flex: 1,
	fontSize: 14,
	fontWeight: 600,
}