import IconButton from "@/components/buttons/IconButton"
import IconToggle from "@/components/buttons/IconToggle"
import Box from "@/components/format/Box"
import TextInput from "@/components/input/TextInput"
import { ListMemo } from "@/components/lists/List"
import CloseIcon from "@/icons/CloseIcon"
import FindIcon from "@/icons/FindIcon"
import { debounce } from "@/utils/time"
import { FunctionComponent, useMemo, useState } from "react"



interface Props {
	items: string[],
	selects: string[],
	onChangeSelects: (items: string[]) => void
}

const ListMultiWithFilter: FunctionComponent<Props> = ({
	items,
	selects,
	onChangeSelects,
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
	const handleClear = () => handleSearchChange("")
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

	return <div style={{ display: "flex", flexDirection: "column" }}>

		<div style={{ display: "flex", position: "relative", alignItems: "center" }}>
			<IconToggle style={{ marginLeft: 3, marginRight: 5 }}
				check={allSelect}
				onChange={handleSelectAll}
			/>
			<TextInput style={{ flex: 1, marginRight: 5 }}
				value={txtSearch}
				onChange={handleSearchChange}
			/>
			{haveValue ? (
				<IconButton onClick={handleClear}><CloseIcon /></IconButton>
			) : (
				<FindIcon />
			)}
		</div>

		<ListMemo
			style={{ maxHeight: 400, overflowY: "auto" }}
			items={itemsShow}
			//items={Array.from({length:1000},(_,i)=>`item::${i}`)}
			select={selects as any}
			RenderRow={({ item }: { item: string }) => <Box>
				<IconToggle
					check={selects.indexOf(item) != -1}
					onChange={select => handleSubjectChange(item)}
				/>
				<div className="lbl-prop">{item}</div>
			</Box>}
		/>

	</div>
}

export default ListMultiWithFilter
