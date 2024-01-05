import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { RenderRowBaseProps } from "../lists/EditList"
import { AUTH_MODE, Auth } from "@/types"
import Button from "@/components/buttons/Button"
import Label from "@/components/input/Label"



const EditAuthRow: FunctionComponent<RenderRowBaseProps<Auth>> = ({
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
	const handleDelete = () => onDelete?.()
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.key == "Delete" || event.key == "Backspace") && isVoid(item)) {
			event.preventDefault()
			onDelete?.()
		}
	}

	// ******************

	const handleFileMode = () => {
		onChange({ mode: AUTH_MODE.CREDS_FILE, creds: "" })
		setTimeout(() => inputRef.current?.select(), 100)
	}
	const handleNoneMode = () => {
		onChange({ mode: AUTH_MODE.NONE })
	}
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		onChange?.({ ...item, creds: value })
	}

	// RENDER
	const delVisible = enter

	return <div
		style={cssRow}
		onMouseEnter={handleEnter}
		onMouseLeave={handleLeave}
	>
		{item == null ? (
			<div style={{ display: "flex", flex: 1 }}>
				<Button label="NONE" onClick={handleNoneMode} />
				<Button label="FILE" onClick={handleFileMode} />
				<Button label="PSW" disabled />
				<Button label="JWT" disabled />
			</div>
		) : item.mode == AUTH_MODE.CREDS_FILE ? (
			<input style={cssInput}
				placeholder="path of creds file"
				type="text"
				ref={inputRef}
				value={item.creds}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
			/>
		) : (
			<Label style={{ flex: 1 }}>NONE</Label>
		)}

		{delVisible && (
			<IconButton
				onClick={handleDelete}
			><CloseIcon /></IconButton>
		)}
	</div>
}

export default EditAuthRow

const isVoid = (item: Auth) => !item || (item.mode == AUTH_MODE.CREDS_FILE && !(item.creds?.length > 0))

const cssRow: React.CSSProperties = {
	minHeight: 24,
	display: "flex",
	alignItems: "center",
}

const cssInput: React.CSSProperties = {
	flex: 1,
}