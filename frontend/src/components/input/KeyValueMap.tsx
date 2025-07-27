import { FunctionComponent, useEffect, useState } from "react"
import { EditList } from "@priolo/jack"
import EditMetadataRow from "@/components/rows/EditMetadataRow.tsx";



interface Props {
	items: { [key: string]: string };
	readOnly?: boolean
	placeholder?: string
	onChange?: (itemsNew: { [key: string]: string }) => void
}

const KeyValueMap: FunctionComponent<Props> = ({
	items,
	readOnly,
	placeholder,
	onChange,
}) => {

	// STORE

	// HOOKs
	const [entres, setEntries] = useState<[string, string][]>(!!items ? Object.entries(items) : [])
	useEffect(() => {
		setEntries(!!items ? Object.entries(items) : [])
	}, [items])

	// HANDLER
	const handleItemsChange = (tuples: [string, string][]) => setEntries(tuples)

	const handleBlur = () => {
		const keyValues = entres.reduce((acc, [key, value]) => {
			if (!!acc[key]) return acc
			acc[key] = value;
			return acc;
		}, {} as { [key: string]: string });
		onChange?.(keyValues)
	}

	// RENDER

	return <div className="lyt-v" onBlur={handleBlur}>
		<EditList<[string, string]>
			items={entres}
			onItemsChange={handleItemsChange}
			readOnly={readOnly}
			placeholder={placeholder}
			onNewItem={() => ["", ""]}
			fnIsVoid={m => !m || (m[0] == "" && m[1] == "")}
			RenderRow={EditMetadataRow}
		/>
	</div>
}

export default KeyValueMap