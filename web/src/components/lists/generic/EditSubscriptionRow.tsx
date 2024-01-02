import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { RenderRowBaseProps } from "./EditList"
import { Subscription } from "@/types"
import Label from "@/components/input/Label"



const EditSubscriptionRow: FunctionComponent<RenderRowBaseProps<Subscription>> = ({
	item,
	focus,
	readOnly,
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
			if (isVoid(item)) onDelete?.()
		}
	}, [focus])

	// HANDLER
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const subject = e.target.value
		onChange?.({ ...item, subject })
	}
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

	// RENDER
	const delVisible = enter
	const value = item.subject

	return <div
		style={cssRow}
		onMouseEnter={handleEnter}
		onMouseLeave={handleLeave}
	>
		{readOnly ? (
			<Label>{value}</Label>
		) : (<>
			<input style={cssInput}
				type="text"
				ref={inputRef}
				value={value}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
			/>
			{delVisible && (
				<IconButton
					onClick={handleDelete}
				><CloseIcon /></IconButton>
			)}
		</>)}
	</div >
}

export default EditSubscriptionRow

const isVoid = (item: Subscription) => !item?.subject || item.subject?.trim().length == 0

const cssRow: React.CSSProperties = {
	minHeight: 24,
	display: "flex",
	alignItems: "center",
}

const cssInput: React.CSSProperties = {
	flex: 1,
}