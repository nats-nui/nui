import IconButton from "@/components/buttons/IconButton"
import IconToggle from "@/components/buttons/IconToggle"
import Label, { LABELS } from "@/components/input/Label"
import CheckOffIcon from "@/icons/CheckOffIcon"
import CheckOnIcon from "@/icons/CheckOnIcon"
import CloseIcon from "@/icons/CloseIcon"
import { Subscription } from "@/types"
import { FunctionComponent, useState } from "react"
import TextInput from "../input/TextInput"
import { RenderRowBaseProps } from "../lists/EditList"
import Box from "../Box"





interface Props extends RenderRowBaseProps<Subscription> {
	noDisable?: boolean
}



const EditSubscriptionRow: FunctionComponent<Props> = ({
	item,
	focus,
	readOnly = false,
	variant = 0,
	noDisable,

	onChange,
	onDelete,
	onFocus,

}) => {

	const handleChange = (subject: string) => {
		onChange?.({ ...item, subject })
	}
	// **********************

	// HOOKS
	const [enter, setEnter] = useState(false)

	// HANDLER

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
	const value = item.subject

	if (readOnly) return <Box preRender={"\u2022 "}>
		<Label type={LABELS.READ}>{value}</Label>
	</Box>

	return <Box
		style={cssRow}
		enterRender={<IconButton onClick={handleDelete}><CloseIcon /></IconButton>}
	>
		{!noDisable && (
			<IconToggle
				check={!item.disabled}
				onChange={handleChangeEnabled}
			/>
		)}
		<TextInput
			style={cssInput(item.disabled)}
			value={value}
			variant={variant}
			focus={focus}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={onFocus}
		/>
	</Box>
}

export default EditSubscriptionRow

const isVoid = (item: Subscription) => !item?.subject || item.subject?.trim().length == 0

const cssRow: React.CSSProperties = {
	minHeight: 24,
	display: "flex",
	alignItems: "center",
}

const cssInput = (disabled: boolean): React.CSSProperties => ({
	flex: 1,
	opacity: disabled ? 0.5 : 1,
})

export const EditSubscriptionNoDisableRow: FunctionComponent<Props> = (props) => <EditSubscriptionRow {...props} noDisable />