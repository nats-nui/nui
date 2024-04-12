import Accordion from "@/components/accordion/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import ListDialog from "@/components/dialogs/ListDialog"
import NumberInput from "@/components/input/NumberInput"
import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent, useState } from "react"
import StringUpRow from "../rows/StringUpRow"



enum BYTE {
	BYTES = "bytes",
	KIB = "kib",
	MIB = "mib",
	GIB = "gib",
	TIB = "tib",
}

interface Props {
	store?: ViewStore
	value: number
	label?: string
	readOnly?: boolean
	onChange?: (valueNew: number) => void
}

const MaxBytesCmp: FunctionComponent<Props> = ({
	store,
	value,
	label,
	readOnly,
	onChange,
}) => {

	// STORE

	// HOOKs
	const [unit, setUnit] = useState(BYTE.BYTES)

	// HANDLER
	const handlePropChange = (valueNew: number) => {
		const maxBytes = valueToBytes(valueNew, unit)
		onChange?.(maxBytes)
	}
	const handleEnabledCheck = (check: boolean) => onChange?.(check ? 0 : -1)
	const handleUnitChange = (index: number) => setUnit(Object.values(BYTE)[index])

	// RENDER
	const isEnabled = value != -1
	const valueShow = bytesToValue(value, unit)

	return <div className="lyt-v">
		<div className="cmp-h">
			<IconToggle
				check={isEnabled}
				onChange={handleEnabledCheck}
				readOnly={readOnly}
			/>
			<div className="lbl-prop">{label}</div>
		</div>
		<Accordion open={isEnabled} height={22}>
			<div className="cmp-h" style={{ minHeight: 22 }}>
				<NumberInput
					style={{ flex: 2 }}
					value={valueShow}
					onChange={handlePropChange}
					readOnly={readOnly}
				/>
				<ListDialog width={100}
					store={store}
					select={Object.values(BYTE).indexOf(unit ?? BYTE.BYTES)}
					items={Object.values(BYTE)}
					RenderRow={StringUpRow}
					readOnly={readOnly}
					onSelect={handleUnitChange}
				/>
			</div>
		</Accordion>
	</div>
}

export default MaxBytesCmp

function bytesToValue(value: number, to: BYTE) {
	switch (to) {
		case BYTE.TIB:
			return Math.round(value / 1099511627776)
		case BYTE.GIB:
			return Math.round(value / 1073741824)
		case BYTE.MIB:
			return Math.round(value / 1048576)
		case BYTE.KIB:
			return Math.round(value / 1024)
		default:
			return value
	}
}

function valueToBytes(value: number, from: BYTE) {
	switch (from) {
		case BYTE.TIB:
			return value * 1099511627776
		case BYTE.GIB:
			return value * 1073741824
		case BYTE.MIB:
			return value * 1048576
		case BYTE.KIB:
			return value * 1024
		default:
			return value
	}
}