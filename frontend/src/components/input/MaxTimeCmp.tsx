import Accordion from "@/components/accordion/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import ListDialog from "@/components/dialogs/ListDialog"
import NumberInput from "@/components/input/NumberInput"
import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent, useState } from "react"
import StringUpRow from "../rows/StringUpRow"



enum TIME {
	NS = "nano s.",
	MS = "milli s.",
	SECONDS = "seconds",
	MINUTES = "minutes",
	HOURS = "hours",
	DAYS = "days",
}

interface Props {
	store?: ViewStore
	label?: string
	value: number
	readOnly?: boolean
	desiredDefault?: number
	initDefault?: number
	onChange?: (valueNew: number) => void
}

const MaxTimeCmp: FunctionComponent<Props> = ({
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
	const [unit, setUnit] = useState(TIME.NS)

	// HANDLER
	const handlePropChange = (value: number) => {
		const duration = valueToNs(value, unit)
		onChange?.(duration)
	}
	const handleEnabledCheck = (check: boolean) => onChange?.(check ? initDefault : desiredDefault)
	const handleUnitChange = (index: number) => setUnit(Object.values(TIME)[index])

	// RENDER
	const isEnabled = value != desiredDefault
	const valueShow = nsToValue(value, unit)

	return <div className="lyt-v">
		<div className="cmp-h">
			<IconToggle
				check={isEnabled}
				onChange={handleEnabledCheck}
				readOnly={readOnly}
			/>
			<div className="lbl-prop">{label}</div>
		</div>
		<Accordion open={isEnabled}>
			<div className="cmp-h" style={{ minHeight: 22 }}>
				<NumberInput
					style={{ flex: 1.5 }}
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
		</Accordion>
	</div>
}

export default MaxTimeCmp

function nsToValue(value: number, from: TIME) {
	let result: number;
	switch (from) {
		case TIME.DAYS:
			result = value / 60 / 60 / 24 / 1e9;
			break;
		case TIME.HOURS:
			result = value / 60 / 60 / 1e9;
			break;
		case TIME.MINUTES:
			result = value / 60 / 1e9;
			break;
		case TIME.SECONDS:
			result = value / 1e9;
			break;
		case TIME.MS:
			result = value / 1e6;
			break;
		case TIME.NS:
			result = value;
			break;
		default:
			result = value;
	}
	return result
}

function valueToNs(value: number, from: TIME) {
	switch (from) {
		case TIME.DAYS:
			return value * 60 * 60 * 24 * 1e9;
		case TIME.HOURS:
			return value * 60 * 60 * 1e9;
		case TIME.MINUTES:
			return value * 60 * 1e9;
		case TIME.SECONDS:
			return value * 1e9;
		case TIME.MS:
			return value * 1e6;
		case TIME.NS:
			return value;
		default:
			return value;
	}
}