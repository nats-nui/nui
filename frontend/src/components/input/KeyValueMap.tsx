import { FunctionComponent, useState } from "react"
import {EditList} from "@priolo/jack"
import EditMetadataRow from "@/components/rows/EditMetadataRow.tsx";



enum TIME {
	NS = "nano s.",
	MS = "milli s.",
	SECONDS = "seconds",
	MINUTES = "minutes",
	HOURS = "hours",
	DAYS = "days",
}

interface Props {
	items: {[key: string]: string};
	readOnly?: boolean
	placeholder?: string
	onChange?: (itemsNew: {[key: string]: string}) => void
}

const KeyValueMap: FunctionComponent<Props> = ({
	items,
	readOnly,
	placeholder,
	onChange,
}) => {

	// STORE

	// HOOKs

	// HANDLER
	const handleItemsChange = (tuples: [string, string][]) => {
		const keyValues = tuples.reduce((acc, [key, value]) => {
			acc[key] = value;
			return acc;
		}, {} as { [key: string]: string });
		onChange?.(keyValues)
	}

	// RENDER

	return <div className="lyt-v">
		<EditList<[string, string]>
			items={!!items ? Object.entries(items) : []}
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