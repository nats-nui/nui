import IconButton from "@/components/buttons/IconButton"
import CloseIcon from "@/icons/CloseIcon"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import { RenderRowBaseProps } from "../lists/EditList"
import { Subscription } from "@/types"
import Label from "@/components/input/Label"
import IconToggle from "@/components/buttons/IconToggle"
import CheckOnIcon from "@/icons/CheckOnIcon"
import CheckOffIcon from "@/icons/CheckOffIcon"



interface Props extends RenderRowBaseProps<Subscription> {
	noDisable?: boolean
}

const EditSubscriptionRow: FunctionComponent<Props> = ({
	item,
	focus,
	readOnly,
	onChange,
	onDelete,
	onFocus,
	noDisable,
}) => {

	useEffect(() => {
		if (focus) {
			inputRef.current?.select()
		} else {
			if (isVoid(item)) onDelete?.()
		}
	}, [focus])
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const subject = e.target.value
		onChange?.({ ...item, subject })
	}
	// **********************

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

	// **********************

	const handleChangeEnabled = (enabled: boolean) => {
		const newSub: Subscription = { ...item, disabled: !enabled }
		onChange?.(newSub)
	}

	// RENDER
	const delVisible = enter && !!onDelete
	const value = item.subject

	return <div
		style={cssRow}
		onMouseEnter={handleEnter}
		onMouseLeave={handleLeave}
	>
		{readOnly ? (
			<Label>{value}</Label>
		) : (<>
			{!noDisable && (
				<IconToggle
					check={!item.disabled}
					onChange={handleChangeEnabled}
					trueIcon={<CheckOnIcon />}
					falseIcon={<CheckOffIcon />}
				/>
			)}
			<input style={cssInput(item.disabled)}
				disabled={item.disabled}
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

const cssInput = (disabled:boolean): React.CSSProperties => ({
	flex: 1,
	opacity: disabled ? 0.5 : 1,
})