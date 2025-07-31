import { ViewStore } from "@/stores/stacks/viewBase"
import { BYTE, bytesToValue, valueToBytes } from "@/utils/conversion"
import { ListDialog, NumberInput, StringUpRow } from "@priolo/jack"
import { FunctionComponent, useState } from "react"



interface Props {
	store?: ViewStore
	value: number
	readOnly?: boolean
	onChange?: (valueNew: number) => void
}

const MaxBytesCmp: FunctionComponent<Props> = ({
	store,
	value,
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
	const handleUnitChange = (index: number) => setUnit(Object.values(BYTE)[index])


	// RENDER
	const valueShow = bytesToValue(value, unit)

	return <div className="jack-cmp-h" style={{ minHeight: 22 }}>
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
}

export default MaxBytesCmp