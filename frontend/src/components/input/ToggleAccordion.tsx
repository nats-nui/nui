import { Accordion, IconToggle } from "@priolo/jack";
import { FunctionComponent } from "react";



interface Props {
	open?: boolean
	label?: string
	readOnly?: boolean
	onChange?: (check: boolean, e?: React.MouseEvent) => void
	children?: React.ReactNode
}

const ToggleAccordion: FunctionComponent<Props> = ({
	open,
	label,
	readOnly,
	onChange,
	children,
}) => {

	// STORE

	// HOOKs

	// HANDLER

	// RENDER

	return <div className="lyt-v">
		<div className="jack-cmp-h">
			<IconToggle
				check={open}
				onChange={onChange}
				readOnly={readOnly}
			/>
			<div className="jack-lbl-prop">{label}</div>
		</div>
		<Accordion open={open}>
			{children}
		</Accordion>
	</div>
}

export default ToggleAccordion


