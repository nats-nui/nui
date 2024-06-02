import Accordion from "@/components/accordion/Accordion"
import IconToggle from "@/components/buttons/IconToggle"
import NumberInput from "@/components/input/NumberInput"
import { FunctionComponent } from "react"



interface Props {
	value: number
	label?: string
	readOnly?: boolean
	desiredDefault?: number
	/** value on open */
	initDefault?: number
	min?: number
	max?: number
	onChange?: (valueNew: number) => void
}

const MaxNumberCmp: FunctionComponent<Props> = ({
	value,
	label,
	readOnly,
	min,
	max,
	onChange,
	desiredDefault = -1,
	initDefault = 0,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handlePropChange = (maxConsumers: number) => onChange?.(maxConsumers)
	const handleEnabledCheck = (check: boolean) => onChange?.(check ? initDefault : desiredDefault)

	// RENDER
	const isEnabled = (value != null || initDefault == null) && value !== desiredDefault
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
					min={min}
					max={max}
				/>
			</div>
		</Accordion>
	</div>
}

export default MaxNumberCmp
