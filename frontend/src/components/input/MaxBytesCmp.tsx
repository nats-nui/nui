import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent, useState } from "react"
import { Accordion, IconToggle, ListDialog, NumberInput, StringUpRow } from "@priolo/jack"
import { valueToBytes, bytesToValue, BYTE } from "@/utils/conversion"



interface Props {
	store?: ViewStore
	value: number
	label?: string
	readOnly?: boolean
	desiredDefault?: number
	initDefault?: number
	onChange?: (valueNew: number) => void
}

const MaxBytesCmp: FunctionComponent<Props> = ({
	store,
	value,
	label,
	readOnly,
	onChange,
   	desiredDefault = -1,
   	initDefault = 0,
}) => {

	// STORE

	// HOOKs
	const [unit, setUnit] = useState(BYTE.BYTES)

	// HANDLER
	const handlePropChange = (valueNew: number) => {
		const maxBytes = valueToBytes(valueNew, unit)
		onChange?.(maxBytes)
	}
	const handleEnabledCheck = (check: boolean) => onChange?.(check ? initDefault : desiredDefault)
	const handleUnitChange = (index: number) => setUnit(Object.values(BYTE)[index])

	// RENDER
	const isEnabled = value != null && value != desiredDefault
	const valueShow = bytesToValue(value, unit)

	return <div className="lyt-v">
		<div className="jack-cmp-h">
			<IconToggle
				check={isEnabled}
				onChange={handleEnabledCheck}
				readOnly={readOnly}
			/>
			<div className="jack-lbl-prop">{label}</div>
		</div>
		<Accordion open={isEnabled} height={22}>
			<div className="jack-cmp-h" style={{ minHeight: 22 }}>
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