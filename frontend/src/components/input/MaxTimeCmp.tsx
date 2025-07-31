import { ViewStore } from "@/stores/stacks/viewBase";
import { getLargestUnit, nsToValue, TIME, valueToNs } from "@/utils/conversion";
import { ListDialog, NumberInput, StringUpRow } from "@priolo/jack";
import { FunctionComponent, useEffect, useState } from "react";
import ToggleAccordion from "./ToggleAccordion";



interface Props {
	store?: ViewStore
	value: number
	readOnly?: boolean
	inputUnit?: TIME
	onChange?: (valueNew: number) => void
}

const MaxTimeCmp: FunctionComponent<Props> = ({
	store,
	value,
	readOnly,
	inputUnit = TIME.NS,
	onChange,
}) => {

	// STORE

	// HOOKs
	const [unit, setUnit] = useState(inputUnit)

	useEffect(() => {
		const largestUnit = getLargestUnit(valueInNs, inputUnit)
		setUnit(largestUnit)
	}, []);


	// HANDLER
	const handlePropChange = (value: number) => {
		const valueShowNs = valueToNs(value, unit)
		const duration = nsToValue(valueShowNs, inputUnit)
		onChange?.(duration)
	}
	const handleUnitChange = (index: number) => setUnit(Object.values(TIME)[index])


	// RENDER
	const valueInNs = valueToNs(value, inputUnit)
	const valueShow = nsToValue(valueInNs, unit)

	return <div className="jack-cmp-h" style={{ minHeight: 22 }}>
		<NumberInput
			style={{ flex: 1 }}
			value={valueShow}
			onChange={handlePropChange}
			readOnly={readOnly}
		/>
		<ListDialog width={100}
			store={store}
			select={Object.values(TIME).indexOf(unit ?? TIME.SECONDS)}
			items={Object.values(TIME)}
			RenderRow={StringUpRow}
			readOnly={readOnly}
			onSelect={handleUnitChange}
		/>
	</div>
}

export default MaxTimeCmp


