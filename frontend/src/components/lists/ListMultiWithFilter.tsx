import IconToggle from "@/components/buttons/IconToggle"
import List from "@/components/lists/List"
import { debounce } from "@/utils/time"
import { FunctionComponent, useMemo, useState } from "react"
import FindInput from "../input/FindInput"



interface Props {
	items: string[],
	selects: string[],
	onChangeSelects: (items: string[]) => void
	renderRow?: (item: string, index: number) => React.ReactNode
}

const ListMultiWithFilter: FunctionComponent<Props> = ({
	items,
	selects,
	onChangeSelects,
	renderRow = (item) => item
}) => {

	// STORE

	// HOOKs
	const [txtSearch, setTxtSearch] = useState<string>(null)
	const [search, setSearch] = useState<string>(null)
	const itemsShow = useMemo(() => {
		if (!search || search.length == 0) return items
		return items.filter(s => s.toLowerCase().includes(search))
	}, [search, items])

	// HANDLER
	const handleSubjectChange = (item: string) => {
		const index = selects.indexOf(item)
		const itemsSelect = [...selects]
		if (index != -1) itemsSelect.splice(index, 1); else itemsSelect.push(item)
		onChangeSelects(itemsSelect)
	}
	const handleSearchChange = (value: string) => {
		setTxtSearch(value)
		debounce(`text-find-list-multi}`, () => setSearch(value.trim().toLowerCase()), items.length > 1000 ? 2000 : 200)
	}
	const handleSelectAll = (check: boolean) => {
		if (!check) {
			onChangeSelects([])
		} else {
			onChangeSelects([...items])
		}
	}

	// RENDER
	const haveValue = search?.length > 0
	const allSelect = selects.length == items.length

	if (!items || items.length == 0) return <div className="lbl-empty lbl-disabled">EMPTY LIST</div>

	return <div style={{ display: "flex", flexDirection: "column" }}>

		{/* FILTER */}
		<div style={{ display: "flex", position: "relative", alignItems: "center", margin: 3 }}>
			<IconToggle style={{ marginLeft: 3, marginRight: 5 }}
				check={allSelect}
				onChange={handleSelectAll}
			/>
			<FindInput
				value={txtSearch}
				onChange={handleSearchChange}
			/>
		</div>

		{/* LIST */}
		<List
			style={{ maxHeight: 400, overflowY: "auto" }}
			items={itemsShow}
			//items={Array.from({length:1000},(_,i)=>`item::${i}`)}
			select={selects as any}

			// RenderRow={({item}) => <div style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
			// 	<IconToggle
			// 		check={selects.indexOf(item) != -1}
			// 		onChange={select => handleSubjectChange(item)}
			// 	/>
			// 	<div className="lbl-prop">{item}</div>
			// </div>}

			RenderRow2={(item, index) => <div style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
				<IconToggle
					check={selects.indexOf(item) != -1}
					onChange={select => handleSubjectChange(item)}
				/>
				{renderRow(item, index)}
			</div>}
		/>

	</div>
}

export default ListMultiWithFilter



// interface PropRow {
// 	item: string
// }

// const Row: FunctionComponent<PropRow> = ({
// 	item,
// }) => {
// 	return <div style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
// 		<IconToggle
// 			check={selects.indexOf(item) != -1}
// 			onChange={select => handleSubjectChange(item)}
// 		/>
// 		<div className="lbl-prop">{item}</div>
// 	</div>
// }