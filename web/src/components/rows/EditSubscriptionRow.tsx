import IconButton from "@/components/buttons/IconButton"
import IconToggle from "@/components/buttons/IconToggle"
import Label, { LABELS } from "@/components/format/Label"
import CloseIcon from "@/icons/CloseIcon"
import { Subscription } from "@/types"
import { FunctionComponent } from "react"
import Box from "../format/Box"
import TextInput from "../input/TextInput"
import { RenderRowBaseProps } from "../lists/EditList"



interface Props extends RenderRowBaseProps<Subscription> {
	noDisable?: boolean
}

const EditSubscriptionRow: FunctionComponent<Props> = ({
	item,
	isSelect,
	readOnly = false,
	noDisable,
	onChange,
	onSelect,
}) => {

	// HOOKS

	// HANDLER
	const handleDelete = () => onChange?.(null)
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.key == "Delete" || event.key == "Backspace") && isVoid(item)) {
			event.preventDefault()
			onChange?.(null)
		}
	}
	const handleChange = (subject: string) => onChange?.({ ...item, subject })
	const handleChangeEnabled = (enabled: boolean) => {
		const newSub: Subscription = { ...item, disabled: !enabled }
		onChange?.(newSub)
	}

	// RENDER
	const value = item.subject
	if (readOnly) return <Label type={LABELS.READ}>{value}</Label>

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
			focus={isSelect}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={onSelect}
		/>
	</Box>
}

export default EditSubscriptionRow

const isVoid = (item: Subscription) => !item?.subject || item.subject?.trim().length == 0

const cssRow: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
}

const cssInput = (disabled: boolean): React.CSSProperties => ({
	flex: 1,
	opacity: disabled ? 0.5 : 1,
})

export const EditSubscriptionNoDisableRow: FunctionComponent<Props> = (props) => <EditSubscriptionRow {...props} noDisable />