import { DialogProps } from "@/components/dialogs/Dialog"
import Label, { LABELS } from "@/components/input/Label"
import { RenderRowBaseProps } from "@/components/lists/EditList"
import List from "@/components/lists/List"
import { FunctionComponent, useState } from "react"
import ElementDialog from "./ElementDialogProps"
import StringRow from "@/components/rows/StringRow"
import ListRow from "@/components/lists/ListRow"



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
	RenderRow = StringRow,
	select,
	style,
	readOnly,
	onSelect,
	
	...props
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const [elemPolicy, setElemPolicy] = useState<HTMLElement>(null)
	const handlePolicyOpen = (e) => setElemPolicy(!!elemPolicy ? null : e.target)
	const handleSelect = (index:number ) => {
		setElemPolicy(null)
		onSelect(index)
	}

	// RENDER
	const value = items[select]

	return <>
		<Label>{props.title}</Label>

		<ListRow
			onClick={handlePolicyOpen}
			readOnly={readOnly}
		>{value}</ListRow>

		<ElementDialog 
			{...props}
			title={null}
			element={elemPolicy}	
			onClose={() => setElemPolicy(null)}
		>
			<List<string>
				select={select}
				items={items}
				RenderRow={RenderRow}
				//variant={variant}
				onSelect={handleSelect}
				readOnly={readOnly}
			/>
		</ElementDialog>
	</>
}

export default ListDialog
