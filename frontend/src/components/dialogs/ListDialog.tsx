import { DialogProps } from "@/components/dialogs/Dialog"
import Component from "@/components/format/Component"
import { RenderRowBaseProps } from "@/components/lists/EditList"
import List from "@/components/lists/List"
import ArrowRightIcon from "@/icons/ArrowRightIcon"
import { FunctionComponent, useState } from "react"
import ElementDialog from "./ElementDialog"



/** un COMPONENT che se premuto apre una DIALOG con una LIST */
interface Props extends DialogProps {
	items: string[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<string>>
	readOnly?: boolean
	/** indice selezionato */
	select?: number
	onSelect?: (index: number) => void
	style?: React.CSSProperties
}

const ListDialog: FunctionComponent<Props> = ({
	items,
	RenderRow = ({ item }) => <div className="list-row">{item?.toString() ?? ""}</div>,
	select,
	style,
	readOnly,
	onSelect,
	...props
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const [element, setElement] = useState<HTMLElement>(null)
	const handleDialogOpen = (e) => setElement(!!element ? null : e.target)
	const handleSelect = (index: number) => {
		setElement(null)
		onSelect(index)
	}

	// RENDER
	if (!items) return null
	const value = RenderRow({ item: items[select] })

	return <>
		<Component style={{ padding: 0}}
			onClick={handleDialogOpen}
			enterRender={<ArrowRightIcon style={{ opacity: 0.5 }} />}
		>{value}</Component>

		<ElementDialog
			{...props}
			title={null}
			element={element}
			onClose={() => setElement(null)}
		>
			<List<string>
				select={select}
				items={items}
				RenderRow={RenderRow}
				onSelect={handleSelect}
				readOnly={readOnly}
			/>
		</ElementDialog>
	</>
}

export default ListDialog
