import Accordion from "@/components/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import NumberInput from "@/components/input/NumberInput"
import { StreamStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: StreamStore
	value: number
	label?: string
	onChange?: (valueNew: number) => void
}

const MaxNumberCmp: FunctionComponent<Props> = ({
	store: streamSo,
	value,
	label,
	onChange,
}) => {

	// STORE
	const streamSa = useStore(streamSo)

	// HOOKs

	// HANDLER
	const handlePropChange = (maxConsumers: number) => {
		onChange?.(maxConsumers)
	}
	const handleEnabledCheck = (check: boolean) => handlePropChange(check ? 0 : -1)

	// RENDER
	const inRead = streamSa.editState == EDIT_STATE.READ
	const inNew = streamSa.editState == EDIT_STATE.NEW
	const isEnabled = value != -1
	const valueShow = value

	return <BoxV>
		<Box>
			<IconToggle
				check={isEnabled}
				onChange={handleEnabledCheck}
				readOnly={inRead || !inNew}
			/>
			<div className="lbl-prop">{label}</div>
		</Box>
		<Accordion open={isEnabled}>
			<Box style={{ minHeight: 22 }}>
				<NumberInput
					style={{ flex: 1 }}
					value={valueShow}
					onChange={handlePropChange}
					readOnly={inRead}
				/>
			</Box>
		</Accordion>
	</BoxV>
}

export default MaxNumberCmp
