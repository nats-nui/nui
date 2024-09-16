import { ViewStore } from "@/stores/stacks/viewBase"
import {FunctionComponent, useEffect, useState} from "react"
import { Accordion, IconToggle, ListDialog, NumberInput, StringUpRow } from "@priolo/jack"



export enum TIME {
	NS = "nano s.",
	MS = "milli s.",
	SECONDS = "seconds",
	MINUTES = "minutes",
	HOURS = "hours",
	DAYS = "days",
}

const unitsInNs = {
	[TIME.NS]: 1,
	[TIME.MS]: 1e6,
	[TIME.SECONDS]: 1e9,
	[TIME.MINUTES]: 60 * 1e9,
	[TIME.HOURS]: 60 * 60 * 1e9,
	[TIME.DAYS]: 60 * 60 * 24 * 1e9
};

interface Props {
	store?: ViewStore
	label?: string
	value: number
	readOnly?: boolean
	desiredDefault?: number
	initDefault?: number
	inputUnit?: TIME
	outputUnit?: TIME
	onChange?: (valueNew: number) => void
}

const MaxTimeCmp: FunctionComponent<Props> = ({
	store,
	value,
	label,
	readOnly,
	desiredDefault = -1,
	initDefault = 0,
	inputUnit = TIME.NS,
	outputUnit = TIME.NS,
	onChange,
}) => {

	// STORE

	// HOOKs
	const [valueShow, setValueShow] = useState(nsToValue(valueToNs(value, outputUnit), inputUnit))

	const [unit, setUnit] = useState(inputUnit)
	const [valueShowNeedUpdate, setValueShowNeedUpdate] = useState(false)

	 useEffect(() => {
	 	const valueInNs = valueToNs(value, outputUnit)
		 console.log(valueInNs)
	 	const largestUnit = getLargestUnit(valueInNs, inputUnit)
		 console.log(largestUnit)
	 	setUnit(largestUnit)
		 setValueShow(nsToValue(valueInNs, largestUnit))
	 }, []);

	useEffect(() => {
		if (valueShowNeedUpdate) {
			handlePropChange(valueShow)
			setValueShowNeedUpdate(false)
		}
	}, [unit,valueShowNeedUpdate])

	// HANDLER
	const handlePropChange = (value: number) => {
		const duration = nsToValue(valueToNs(value, unit), outputUnit)
		setValueShow(nsToValue(valueToNs(duration, outputUnit), unit))
		onChange?.(duration)
	}
	const handleUnitChange = (index: number) => {
		setValueShowNeedUpdate(true)
		setUnit(Object.values(TIME)[index])
	}

	const handleEnabledCheck = (check: boolean) => onChange?.(check ? initDefault : desiredDefault)

	// RENDER
	const isEnabled = (value != null || initDefault == null) && value !== desiredDefault

	return <div className="lyt-v">
		<div className="jack-cmp-h">
			<IconToggle
				check={isEnabled}
				onChange={handleEnabledCheck}
				readOnly={readOnly}
			/>
			<div className="jack-lbl-prop">{label}</div>
		</div>
		<Accordion open={isEnabled}>
			<div className="jack-cmp-h" style={{ minHeight: 22 }}>
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
	return value / unitsInNs[from];
}

function valueToNs(value: number, from: TIME) {
	return value * unitsInNs[from];
}

function  getLargestUnit(valueInNs: number, defaultUnit: TIME): TIME {
	let largestUnit = TIME.NS;
	if (valueInNs == 0) {
		return defaultUnit;
	}
	for (const [unit, ns] of Object.entries(unitsInNs)) {
		if (valueInNs % ns  == 0) {
			largestUnit = unit as TIME;
		} else {
			break;
		}
	}

	return largestUnit;
}

