import Accordion from "@/components/accordion/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import NumberInput from "@/components/input/NumberInput"
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
	const handlePropChange = (maxConsumers: number) => onChange?.(maxConsumers)
	const handleEnabledCheck = (check: boolean) => onChange?.(check ? 0 : -1)

	// RENDER
	const isEnabled = value != -1
	const valueShow = value

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
					style={{ flex: 1 }}
					value={valueShow}
					onChange={handlePropChange}
					readOnly={readOnly}
				/>
			</div>
		</Accordion>
	</div>
}

export default MaxNumberCmp
