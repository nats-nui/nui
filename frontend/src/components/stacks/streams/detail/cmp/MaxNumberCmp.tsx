import Accordion from "@/components/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import Box from "@/components/format/Box"
import BoxV from "@/components/format/BoxV"
import NumberInput from "@/components/input/NumberInput"
import { ViewStore } from "@/stores/stacks/viewBase"
import { FunctionComponent } from "react"



interface Props {
	value: number
	label?: string
	readOnly?: boolean
	onChange?: (valueNew: number) => void
}

const MaxNumberCmp: FunctionComponent<Props> = ({
	value,
	label,
	readOnly,
	onChange,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handlePropChange = (maxConsumers: number) => {
		onChange?.(maxConsumers)
	}
	const handleEnabledCheck = (check: boolean) => handlePropChange(check ? 0 : -1)

	// RENDER
	const isEnabled = value != -1
	const valueShow = value

	return <BoxV>
		<Box>
			<IconToggle
				check={isEnabled}
				onChange={handleEnabledCheck}
				readOnly={readOnly}
			/>
			<div className="lbl-prop">{label}</div>
		</Box>
		<Accordion open={isEnabled}>
			<Box style={{ minHeight: 22 }}>
				<NumberInput
					style={{ flex: 1 }}
					value={valueShow}
					onChange={handlePropChange}
					readOnly={readOnly}
				/>
			</Box>
		</Accordion>
	</BoxV>
}

export default MaxNumberCmp
