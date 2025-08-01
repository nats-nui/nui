import { NumberInput } from "@priolo/jack"
import { FunctionComponent } from "react"
import ToggleAccordion from "./ToggleAccordion"



interface Props {
	value: number
	label?: string
	readOnly?: boolean
	desiredDefault?: number
	/** value on open */
	initDefault?: number
	min?: number
	max?: number
	onChange?: (valueNew: number) => void
}

const ToggleMaxNumberCmp: FunctionComponent<Props> = ({
	min,
	max,

	value,
	label,
	readOnly,
	desiredDefault = -1,
	initDefault = 0,
	onChange,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleEnabledCheck = (check: boolean) => onChange?.(check ? initDefault : desiredDefault)

	// RENDER
	const isOpen = (value != null || initDefault == null) && value !== desiredDefault

	return <ToggleAccordion
		open={isOpen}
		label={label}
		readOnly={readOnly}
		onOpenChange={handleEnabledCheck}
	>
		<NumberInput
			style={{ flex: 1 }}
			value={value}
			onChange={onChange}
			readOnly={readOnly}
			min={min}
			max={max}
		/>
	</ToggleAccordion>
}

export default ToggleMaxNumberCmp
