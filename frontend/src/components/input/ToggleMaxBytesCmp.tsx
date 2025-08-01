import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent } from "react"
import MaxBytesCmp from "./MaxBytesCmp"
import ToggleAccordion from "./ToggleAccordion"



interface Props {
	store?: ViewStore
	value: number
	label?: string
	readOnly?: boolean
	desiredDefault?: number
	initDefault?: number
	onChange?: (valueNew: number) => void
}

const ToggleMaxBytesCmp: FunctionComponent<Props> = ({
	store,

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
		<MaxBytesCmp
			store={store}
			value={value}
			readOnly={readOnly}
			onChange={onChange}
		/>
	</ToggleAccordion>
}

export default ToggleMaxBytesCmp