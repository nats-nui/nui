import { ViewStore } from "@/stores/stacks/viewBase";
import { TIME } from "@/utils/conversion";
import { FunctionComponent } from "react";
import MaxTimeCmp from "./MaxTimeCmp";
import ToggleAccordion from "./ToggleAccordion";



interface Props {
	store?: ViewStore
	label?: string
	value: number
	readOnly?: boolean
	desiredDefault?: number
	initDefault?: number
	inputUnit?: TIME
	onChange?: (valueNew: number) => void
}

const ToggleMaxTimeCmp: FunctionComponent<Props> = ({
	store,
	inputUnit = TIME.NS,

	value,
	label,
	readOnly,
	onChange,
	desiredDefault = -1,
	initDefault = 0,
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
		<MaxTimeCmp
			store={store}
			value={value}
			readOnly={readOnly}
			inputUnit={inputUnit}
			onChange={onChange}
		/>
	</ToggleAccordion>
}

export default ToggleMaxTimeCmp


