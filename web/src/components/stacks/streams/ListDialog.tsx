import { DialogProps } from "@/components/dialogs/Dialog"
import Label from "@/components/input/Label"
import { RenderRowBaseProps } from "@/components/lists/EditList"
import List from "@/components/lists/List"
import ListRow from "@/components/lists/ListRow"
import { FunctionComponent, useState } from "react"
import ElementDialog from "../../dialogs/ElementDialog"



interface Props extends DialogProps  {
	items: string[]
	RenderRow?: FunctionComponent<RenderRowBaseProps<string>>
	variant?: number
	readOnly?: boolean
	/** indice selezionato */
	select?: number
	onSelect?: (index: number) => void
	style?: React.CSSProperties
}

const ListDialog: FunctionComponent<Props> = ({
	items,
	RenderRow,
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
	const handleSelect = (index:number ) => {
		setElement(null)
		onSelect(index)
	}

	// RENDER
	const value = items[select]

	return <>
		<Label>{props.title}</Label>

		<ListRow
			onClick={handleDialogOpen}
			readOnly={readOnly}
		>{value}</ListRow>

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
